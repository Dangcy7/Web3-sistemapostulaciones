const pool = require("../config/database");
const postulantesService = require("./postulantes.service");
const { esNivelConocimientoValido } = require("../constants/niveles-conocimiento");
const { evaluarPostulante, ordenarCandidatos } = require("./compatibilidad.service");

const IMPORTANCIAS = new Set(["indispensable", "deseable"]);

async function cargarRequisitos(solicitudId) {
    const [lenguajes] = await pool.execute(
        `SELECT sl.lenguaje_id AS id, l.nombre, sl.importancia, sl.nivel_minimo
         FROM solicitud_lenguaje sl
         INNER JOIN lenguaje l ON l.id = sl.lenguaje_id
         WHERE sl.solicitud_id = ? ORDER BY l.nombre`,
        [solicitudId]
    );
    const [herramientas] = await pool.execute(
        `SELECT sh.herramienta_id AS id, h.nombre, sh.importancia, sh.nivel_minimo
         FROM solicitud_herramienta sh
         INNER JOIN herramienta h ON h.id = sh.herramienta_id
         WHERE sh.solicitud_id = ? ORDER BY h.nombre`,
        [solicitudId]
    );
    return { lenguajes, herramientas };
}

async function obtenerSolicitudPorId(id) {
    const [filas] = await pool.execute(
        `SELECT id, titulo, descripcion, creada_en, tipo_contratacion
         FROM solicitud_trabajo WHERE id = ?`,
        [id]
    );
    if (!filas.length) return null;
    const [jornadas] = await pool.execute(
        `SELECT jornada FROM solicitud_jornada WHERE solicitud_id = ? ORDER BY jornada`,
        [id]
    );
    const [modalidades] = await pool.execute(
        `SELECT modalidad FROM solicitud_modalidad WHERE solicitud_id = ? ORDER BY modalidad`,
        [id]
    );
    return {
        ...filas[0],
        ...(await cargarRequisitos(id)),
        jornadas: jornadas.map(item => item.jornada),
        modalidades: modalidades.map(item => item.modalidad)
    };
}

async function listarSolicitudes() {
    const [solicitudes] = await pool.execute(
        `SELECT id, titulo, descripcion, creada_en, tipo_contratacion
         FROM solicitud_trabajo ORDER BY creada_en DESC, id DESC`
    );
    return Promise.all(solicitudes.map(async solicitud => ({
        ...solicitud,
        ...(await cargarRequisitos(solicitud.id)),
        jornadas: (await pool.execute(
            `SELECT jornada FROM solicitud_jornada WHERE solicitud_id = ? ORDER BY jornada`,
            [solicitud.id]
        ))[0].map(item => item.jornada),
        modalidades: (await pool.execute(
            `SELECT modalidad FROM solicitud_modalidad WHERE solicitud_id = ? ORDER BY modalidad`,
            [solicitud.id]
        ))[0].map(item => item.modalidad)
    })));
}

async function comprobarCatalogos(requisitos) {
    for (const [table, values] of [["lenguaje", requisitos.lenguajes], ["herramienta", requisitos.herramientas]]) {
        if (!values.length) continue;
        const placeholders = values.map(() => "?").join(", ");
        const [rows] = await pool.execute(
            `SELECT id FROM ${table} WHERE id IN (${placeholders})`,
            values.map(item => item.id)
        );
        if (rows.length !== values.length) return false;
    }
    return true;
}

async function crearSolicitud(datos) {
    for (const requisito of [...datos.lenguajes, ...datos.herramientas]) {
        if (requisito.nivel_minimo !== null && !esNivelConocimientoValido(requisito.nivel_minimo)) {
            const error = new Error("El nivel mínimo de un requisito no es válido");
            error.code = "INVALID_KNOWLEDGE_LEVEL";
            throw error;
        }
    }
    if (!(await comprobarCatalogos(datos))) {
        const error = new Error("Uno o más requisitos no existen en los catálogos actuales");
        error.code = "INVALID_CATALOG_ITEM";
        throw error;
    }

    const conexion = await pool.getConnection();
    try {
        await conexion.beginTransaction();
        const [resultado] = await conexion.execute(
            `INSERT INTO solicitud_trabajo (admin_usuario_id, titulo, descripcion, tipo_contratacion)
             VALUES (?, ?, ?, ?)`,
            [datos.adminUsuarioId, datos.titulo, datos.descripcion, datos.tipo_contratacion]
        );
        const solicitudId = resultado.insertId;

        for (const requisito of datos.lenguajes) {
            await conexion.execute(
                `INSERT INTO solicitud_lenguaje (solicitud_id, lenguaje_id, importancia, nivel_minimo)
                 VALUES (?, ?, ?, ?)`,
                [solicitudId, requisito.id, requisito.importancia, requisito.nivel_minimo]
            );
        }
        for (const requisito of datos.herramientas) {
            await conexion.execute(
                `INSERT INTO solicitud_herramienta (solicitud_id, herramienta_id, importancia, nivel_minimo)
                 VALUES (?, ?, ?, ?)`,
                [solicitudId, requisito.id, requisito.importancia, requisito.nivel_minimo]
            );
        }
        for (const jornada of datos.jornadas) {
            await conexion.execute(
                `INSERT INTO solicitud_jornada (solicitud_id, jornada) VALUES (?, ?)`,
                [solicitudId, jornada]
            );
        }
        for (const modalidad of datos.modalidades) {
            await conexion.execute(
                `INSERT INTO solicitud_modalidad (solicitud_id, modalidad) VALUES (?, ?)`,
                [solicitudId, modalidad]
            );
        }

        await conexion.commit();
        return await obtenerSolicitudPorId(solicitudId);
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
}

async function obtenerCoincidencias(solicitudId) {
    const solicitud = await obtenerSolicitudPorId(solicitudId);
    if (!solicitud) return null;

    const [postulantes] = await pool.execute(
        `SELECT id, nombre, apellido, correo, ciudad FROM postulante ORDER BY id`
    );
    const perfiles = await Promise.all(postulantes.map(postulante =>
        postulantesService.obtenerPorId(postulante.id)
    ));

    const evaluados = perfiles.filter(Boolean).map(perfil => evaluarPostulante(perfil, solicitud));
    const categorias = {
        compatibles: ordenarCandidatos(evaluados.filter(item => item.estado === "compatible")),
        noCumplenObligatorios: ordenarCandidatos(evaluados.filter(item => item.estado === "no_cumple_obligatorios")),
        noDisponibles: ordenarCandidatos(evaluados.filter(item => item.estado === "no_disponible")),
        informacionInsuficiente: ordenarCandidatos(evaluados.filter(item => item.estado === "informacion_insuficiente"))
    };

    return {
        solicitud,
        totalAptos: categorias.compatibles.length,
        puntuacion: {
            formula: "requisitos técnicos deseables cumplidos / total de requisitos técnicos deseables × 100",
            reglaSinDeseables: "Si no hay requisitos deseables, un candidato compatible obtiene 100%; otros estados muestran el porcentaje como no disponible.",
            detalle: "Cada requisito técnico deseable tiene el mismo peso. Los indispensables y la disponibilidad no se ocultan dentro del porcentaje. Un nivel declarado que alcanza el mínimo es provisional. La experiencia queda para revisión humana."
        },
        postulantes: categorias.compatibles,
        categorias
    };
}

module.exports = { listarSolicitudes, crearSolicitud, obtenerCoincidencias, IMPORTANCIAS };
