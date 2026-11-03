const pool = require("../config/database");
const postulantesService = require("./postulantes.service");
const { esNivelConocimientoValido } = require("../constants/niveles-conocimiento");

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
        `SELECT id, titulo, descripcion, creada_en
         FROM solicitud_trabajo WHERE id = ?`,
        [id]
    );
    if (!filas.length) return null;
    return { ...filas[0], ...(await cargarRequisitos(id)) };
}

async function listarSolicitudes() {
    const [solicitudes] = await pool.execute(
        `SELECT id, titulo, descripcion, creada_en
         FROM solicitud_trabajo ORDER BY creada_en DESC, id DESC`
    );
    return Promise.all(solicitudes.map(async solicitud => ({
        ...solicitud,
        ...(await cargarRequisitos(solicitud.id))
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
            `INSERT INTO solicitud_trabajo (admin_usuario_id, titulo, descripcion)
             VALUES (?, ?, ?)`,
            [datos.adminUsuarioId, datos.titulo, datos.descripcion]
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

    const requisitosIndispensables = [
        ...solicitud.lenguajes.filter(item => item.importancia === "indispensable").map(item => ({ tipo: "lenguajes", id: item.id })),
        ...solicitud.herramientas.filter(item => item.importancia === "indispensable").map(item => ({ tipo: "herramientas", id: item.id }))
    ];
    const requisitosDeseables = [
        ...solicitud.lenguajes.filter(item => item.importancia === "deseable").map(item => ({ tipo: "lenguajes", id: item.id })),
        ...solicitud.herramientas.filter(item => item.importancia === "deseable").map(item => ({ tipo: "herramientas", id: item.id }))
    ];

    const coincidencias = perfiles.flatMap(perfil => {
        if (!perfil) return [];
        const idsLenguajes = new Set(perfil.lenguajes.map(item => Number(item.id)));
        const idsHerramientas = new Set(perfil.herramientas.map(item => Number(item.id)));
        const tiene = requisito => (requisito.tipo === "lenguajes" ? idsLenguajes : idsHerramientas).has(Number(requisito.id));
        const indispensablesCumplidos = requisitosIndispensables.filter(tiene).length;
        if (indispensablesCumplidos !== requisitosIndispensables.length) return [];

        const deseablesCumplidos = requisitosDeseables.filter(tiene).length;
        const porcentaje = requisitosDeseables.length
            ? Math.round((deseablesCumplidos / requisitosDeseables.length) * 100)
            : 100;
        return [{
            id: perfil.id,
            nombre: perfil.nombre,
            apellido: perfil.apellido,
            correo: perfil.correo,
            ciudad: perfil.ciudad,
            coincidencia: porcentaje,
            deseablesCumplidos,
            totalDeseables: requisitosDeseables.length,
            indispensablesCumplidos,
            totalIndispensables: requisitosIndispensables.length
        }];
    });

    coincidencias.sort((a, b) => b.coincidencia - a.coincidencia ||
        `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es"));

    return {
        solicitud,
        totalAptos: coincidencias.length,
        puntuacion: {
            formula: "requisitos deseables cumplidos / total de requisitos deseables × 100",
            reglaSinDeseables: "Un postulante que cumple todos los indispensables obtiene 100% si no hay requisitos deseables.",
            detalle: "Cada lenguaje o herramienta deseable tiene el mismo peso. Los requisitos indispensables solo determinan aptitud. No se infieren niveles de dominio."
        },
        postulantes: coincidencias
    };
}

module.exports = { listarSolicitudes, crearSolicitud, obtenerCoincidencias, IMPORTANCIAS };
