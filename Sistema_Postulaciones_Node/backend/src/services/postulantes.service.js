
const pool = require("../config/database");
const bcrypt = require("bcrypt");

// Obtener todos los postulantes
async function obtenerTodos() {
    const [postulantes] = await pool.execute(
        `SELECT id, nombre, apellido, telefono, correo, ciudad
         FROM postulante
         ORDER BY id ASC`
    );

    return postulantes;
}

async function correoExiste(correo) {
    const [filas] = await pool.execute(
        `SELECT id FROM postulante WHERE correo = ? LIMIT 1`,
        [correo]
    );

    return filas.length > 0;
}

// Obtener el perfil completo de un postulante
async function obtenerPorId(id) {
    const [postulantes] = await pool.execute(
        `SELECT id, nombre, apellido, telefono, correo, ciudad, disponibilidad
         FROM postulante
         WHERE id = ?`,
        [id]
    );

    if (postulantes.length === 0) {
        return null;
    }

    const postulante = postulantes[0];

    const [formacion] = await pool.execute(
        `SELECT nivel, carrera, institucion
         FROM formacion
         WHERE postulante_id = ?`,
        [id]
    );

    const [experiencias] = await pool.execute(
        `SELECT lugar, tipo, puesto, años_experiencia
         FROM experiencia_laboral
         WHERE postulante_id = ?`,
        [id]
    );

    const [proyectos] = await pool.execute(
        `SELECT nombre, descripcion, enlace
         FROM proyecto
         WHERE postulante_id = ?`,
        [id]
    );

    const [lenguajes] = await pool.execute(
        `SELECT l.id, l.nombre,
                pl.nivel_declarado, pl.nivel_verificado,
                pl.verificado_por_usuario_id,
                u.usuario AS verificado_por_usuario,
                pl.verificado_en
         FROM lenguaje l
         INNER JOIN postulante_lenguaje pl
             ON pl.lenguaje_id = l.id
         LEFT JOIN usuario u ON u.id = pl.verificado_por_usuario_id
         WHERE pl.postulante_id = ?`,
        [id]
    );

    const [herramientas] = await pool.execute(
        `SELECT h.id, h.nombre,
                ph.nivel_declarado, ph.nivel_verificado,
                ph.verificado_por_usuario_id,
                u.usuario AS verificado_por_usuario,
                ph.verificado_en
         FROM herramienta h
         INNER JOIN postulante_herramienta ph
             ON ph.herramienta_id = h.id
         LEFT JOIN usuario u ON u.id = ph.verificado_por_usuario_id
         WHERE ph.postulante_id = ?`,
        [id]
    );

    const [jornadas] = await pool.execute(
        `SELECT jornada FROM postulante_jornada WHERE postulante_id = ? ORDER BY jornada`,
        [id]
    );

    const [modalidades] = await pool.execute(
        `SELECT modalidad FROM postulante_modalidad WHERE postulante_id = ? ORDER BY modalidad`,
        [id]
    );

    return {
        ...postulante,
        formacion,
        experiencias,
        lenguajes,
        herramientas,
        jornadas: jornadas.map(item => item.jornada),
        modalidades: modalidades.map(item => item.modalidad),
        proyectos
    };
}


async function crear(datos) {
    const { nombre, apellido, telefono, correo, ciudad } = datos;

    const [resultado] = await pool.execute(
        `INSERT INTO postulante
            (nombre, apellido, telefono, correo, ciudad)
         VALUES (?, ?, ?, ?, ?)`,
        [nombre, apellido, telefono, correo, ciudad]
    );

    return obtenerPorId(resultado.insertId);
}


// Registrar un postulante con todo su perfil y cuenta de acceso
async function crearPerfilCompleto(datos) {
    console.log("EJECUTANDO NUEVO REGISTRO COMPLETO");
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const {
            nombre,
            apellido,
            telefono,
            correo,
            ciudad,
            usuario,
            contraseña,
            formacion = [],
            experiencias = [],
            lenguajes = [],
            herramientas = [],
            proyectos = []
        } = datos;

        // 1. Registrar datos personales
        const [resultado] = await conexion.execute(
            `INSERT INTO postulante
                (nombre, apellido, telefono, correo, ciudad)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, apellido, telefono, correo, ciudad]
        );

        const postulanteId = resultado.insertId;

        // 2. Crear cuenta de acceso con contraseña cifrada
        const hash = await bcrypt.hash(contraseña, 10);

        await conexion.execute(
            `INSERT INTO usuario
                (usuario, contrasena, rol, postulante_id)
             VALUES (?, ?, 'postulante', ?)`,
            [usuario, hash, postulanteId]
        );

        // 3. Registrar formación
        for (const estudio of formacion) {
            await conexion.execute(
                `INSERT INTO formacion
                    (postulante_id, nivel, carrera, institucion)
                 VALUES (?, ?, ?, ?)`,
                [postulanteId, estudio.nivel, estudio.carrera, estudio.institucion]
            );
        }

        // 4. Registrar experiencias
        for (const experiencia of experiencias) {
            await conexion.execute(
                `INSERT INTO experiencia_laboral
                    (postulante_id, lugar, tipo, puesto, años_experiencia)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    postulanteId,
                    experiencia.lugar,
                    experiencia.tipo,
                    experiencia.puesto,
                    experiencia.años_experiencia
                ]
            );
        }

        // 5. Registrar lenguajes
        for (const conocimiento of lenguajes) {
            await conexion.execute(
                `INSERT INTO postulante_lenguaje
                    (postulante_id, lenguaje_id, nivel_declarado)
                 VALUES (?, ?, ?)`,
                [postulanteId, conocimiento.id, conocimiento.nivel_declarado ?? null]
            );
        }

        // 6. Registrar herramientas
        for (const conocimiento of herramientas) {
            await conexion.execute(
                `INSERT INTO postulante_herramienta
                    (postulante_id, herramienta_id, nivel_declarado)
                 VALUES (?, ?, ?)`,
                [postulanteId, conocimiento.id, conocimiento.nivel_declarado ?? null]
            );
        }

        // 7. Registrar proyectos
        for (const proyecto of proyectos) {
            await conexion.execute(
                `INSERT INTO proyecto
                    (postulante_id, nombre, descripcion, enlace)
                 VALUES (?, ?, ?, ?)`,
                [
                    postulanteId,
                    proyecto.nombre,
                    proyecto.descripcion,
                    proyecto.enlace
                ]
            );
        }

        await conexion.commit();
        return postulanteId;

    } catch (error) {
        await conexion.rollback();
        throw error;

    } finally {
        conexion.release();
    }
}


// Actualizar un perfil completo
async function actualizarPerfilCompleto(id, datos) {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [existentes] = await conexion.execute(
            `SELECT id, disponibilidad FROM postulante WHERE id = ? FOR UPDATE`,
            [id]
        );

        if (existentes.length === 0) {
            await conexion.rollback();
            return false;
        }

        const {
            nombre,
            apellido,
            telefono,
            correo,
            ciudad,
            formacion = [],
            experiencias = [],
            lenguajes = [],
            herramientas = [],
            proyectos = [],
            disponibilidad,
            jornadas,
            modalidades
        } = datos;

        const disponibilidadActualizada = disponibilidad === undefined
            ? existentes[0].disponibilidad
            : disponibilidad;

        // 1. Actualizar datos personales
        await conexion.execute(
            `UPDATE postulante
             SET nombre = ?, apellido = ?, telefono = ?,
                 correo = ?, ciudad = ?, disponibilidad = ?
             WHERE id = ?`,
            [nombre, apellido, telefono, correo, ciudad, disponibilidadActualizada, id]
        );

        if (jornadas !== undefined) {
            await sincronizarPreferencias(conexion, "postulante_jornada", "jornada", "postulante_id", id, jornadas);
        }
        if (modalidades !== undefined) {
            await sincronizarPreferencias(conexion, "postulante_modalidad", "modalidad", "postulante_id", id, modalidades);
        }

        // 2. Eliminar información profesional anterior
        await conexion.execute(
            `DELETE FROM formacion WHERE postulante_id = ?`, [id]
        );

        await conexion.execute(
            `DELETE FROM experiencia_laboral WHERE postulante_id = ?`, [id]
        );

        await conexion.execute(
            `DELETE FROM proyecto WHERE postulante_id = ?`, [id]
        );

        await sincronizarConocimientos(conexion, {
            tabla: "postulante_lenguaje",
            columnaCatalogo: "lenguaje_id",
            postulanteId: id,
            conocimientos: lenguajes
        });
        await sincronizarConocimientos(conexion, {
            tabla: "postulante_herramienta",
            columnaCatalogo: "herramienta_id",
            postulanteId: id,
            conocimientos: herramientas
        });

        // 3. Registrar nuevamente la formación
        for (const estudio of formacion) {
            await conexion.execute(
                `INSERT INTO formacion
                    (postulante_id, nivel, carrera, institucion)
                 VALUES (?, ?, ?, ?)`,
                [id, estudio.nivel, estudio.carrera, estudio.institucion]
            );
        }

        // 4. Registrar nuevamente las experiencias
        for (const experiencia of experiencias) {
            await conexion.execute(
                `INSERT INTO experiencia_laboral
                    (postulante_id, lugar, tipo, puesto, años_experiencia)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    id,
                    experiencia.lugar,
                    experiencia.tipo,
                    experiencia.puesto,
                    experiencia.años_experiencia
                ]
            );
        }

        // 5. Registrar nuevamente los proyectos
        for (const proyecto of proyectos) {
            await conexion.execute(
                `INSERT INTO proyecto
                    (postulante_id, nombre, descripcion, enlace)
                 VALUES (?, ?, ?, ?)`,
                [
                    id,
                    proyecto.nombre,
                    proyecto.descripcion,
                    proyecto.enlace
                ]
            );
        }

        await conexion.commit();
        return true;

    } catch (error) {
        await conexion.rollback();
        throw error;

    } finally {
        conexion.release();
    }
}

async function sincronizarConocimientos(conexion, configuracion) {
    const { tabla, columnaCatalogo, postulanteId, conocimientos } = configuracion;
    const [actuales] = await conexion.execute(
        `SELECT ${columnaCatalogo} AS id, nivel_declarado
         FROM ${tabla} WHERE postulante_id = ? FOR UPDATE`,
        [postulanteId]
    );
    const actualesPorId = new Map(actuales.map(item => [Number(item.id), item]));
    const idsRecibidos = conocimientos.map(item => Number(item.id));

    const idsEliminados = actuales
        .filter(item => !idsRecibidos.includes(Number(item.id)))
        .map(item => Number(item.id));
    if (idsEliminados.length > 0) {
        const placeholdersEliminados = idsEliminados.map(() => "?").join(", ");
        const [verificados] = await conexion.execute(
            `SELECT ${columnaCatalogo} AS id FROM ${tabla}
             WHERE postulante_id = ? AND ${columnaCatalogo} IN (${placeholdersEliminados})
               AND nivel_verificado IS NOT NULL FOR UPDATE`,
            [postulanteId, ...idsEliminados]
        );
        if (verificados.length > 0) {
            throw Object.assign(new Error("No puedes quitar un conocimiento que tiene un nivel verificado por administración."), {
                code: "VERIFIED_KNOWLEDGE_LOCKED"
            });
        }
    }

    if (idsRecibidos.length === 0) {
        await conexion.execute(`DELETE FROM ${tabla} WHERE postulante_id = ?`, [postulanteId]);
        return;
    }

    const placeholders = idsRecibidos.map(() => "?").join(", ");
    await conexion.execute(
        `DELETE FROM ${tabla}
         WHERE postulante_id = ? AND ${columnaCatalogo} NOT IN (${placeholders})`,
        [postulanteId, ...idsRecibidos]
    );

    for (const conocimiento of conocimientos) {
        const conocimientoId = Number(conocimiento.id);
        const actual = actualesPorId.get(conocimientoId);
        const nivel = conocimiento.nivel_declarado;

        if (actual) {
            // El cliente anterior solo enviaba IDs. También se acepta NULL
            // para una asociación histórica pendiente, sin borrar verificaciones.
            if (nivel === undefined || nivel === null) {
                if (nivel === null && actual.nivel_declarado !== null) {
                    throw Object.assign(new Error("No puedes borrar un nivel declarado; selecciona uno válido."), {
                        code: "INVALID_KNOWLEDGE_LEVEL"
                    });
                }
                continue;
            }
            await conexion.execute(
                `UPDATE ${tabla} SET nivel_declarado = ?
                 WHERE postulante_id = ? AND ${columnaCatalogo} = ?`,
                [nivel, postulanteId, conocimientoId]
            );
            continue;
        }

        if (!conocimiento.legacy && (nivel === undefined || nivel === null)) {
            throw Object.assign(new Error("Selecciona un nivel para cada conocimiento nuevo."), {
                code: "INVALID_KNOWLEDGE_LEVEL"
            });
        }
        await conexion.execute(
            `INSERT INTO ${tabla} (postulante_id, ${columnaCatalogo}, nivel_declarado)
             VALUES (?, ?, ?)`,
            [postulanteId, conocimientoId, nivel ?? null]
        );
    }
}

async function sincronizarPreferencias(conexion, tabla, columna, columnaPerfil, perfilId, valores) {
    const configuraciones = {
        postulante_jornada: { columna: "jornada", perfil: "postulante_id" },
        postulante_modalidad: { columna: "modalidad", perfil: "postulante_id" }
    };
    const permitida = configuraciones[tabla];
    if (!permitida || permitida.columna !== columna || permitida.perfil !== columnaPerfil) {
        throw new Error("Configuración de preferencias no permitida");
    }
    await conexion.execute(`DELETE FROM ${tabla} WHERE ${columnaPerfil} = ?`, [perfilId]);
    for (const valor of valores) {
        await conexion.execute(
            `INSERT INTO ${tabla} (${columnaPerfil}, ${columna}) VALUES (?, ?)`,
            [perfilId, valor]
        );
    }
}

async function verificarConocimiento({ postulanteId, tipo, catalogoId, nivel, adminUsuarioId }) {
    const configuraciones = {
        lenguajes: { tabla: "postulante_lenguaje", columna: "lenguaje_id" },
        herramientas: { tabla: "postulante_herramienta", columna: "herramienta_id" }
    };
    const configuracion = configuraciones[tipo];
    if (!configuracion) return null;

    const { tabla, columna } = configuracion;
    const [existentes] = await pool.execute(
        `SELECT ${columna} AS id FROM ${tabla}
         WHERE postulante_id = ? AND ${columna} = ? LIMIT 1`,
        [postulanteId, catalogoId]
    );
    if (!existentes.length) return null;

    await pool.execute(
        `UPDATE ${tabla}
         SET nivel_verificado = ?, verificado_por_usuario_id = ?, verificado_en = CURRENT_TIMESTAMP
         WHERE postulante_id = ? AND ${columna} = ?`,
        [nivel, adminUsuarioId, postulanteId, catalogoId]
    );

    const [resultado] = await pool.execute(
        `SELECT relacion.nivel_declarado, relacion.nivel_verificado,
                relacion.verificado_por_usuario_id,
                usuario.usuario AS verificado_por_usuario,
                relacion.verificado_en
         FROM ${tabla} relacion
         LEFT JOIN usuario ON usuario.id = relacion.verificado_por_usuario_id
         WHERE relacion.postulante_id = ? AND relacion.${columna} = ?`,
        [postulanteId, catalogoId]
    );
    return resultado[0] || null;
}

async function retirarVerificacionConocimiento({ postulanteId, tipo, catalogoId }) {
    const configuraciones = {
        lenguajes: { tabla: "postulante_lenguaje", columna: "lenguaje_id" },
        herramientas: { tabla: "postulante_herramienta", columna: "herramienta_id" }
    };
    const configuracion = configuraciones[tipo];
    if (!configuracion) return null;

    const { tabla, columna } = configuracion;
    const [existentes] = await pool.execute(
        `SELECT ${columna} AS id FROM ${tabla}
         WHERE postulante_id = ? AND ${columna} = ? LIMIT 1`,
        [postulanteId, catalogoId]
    );
    if (!existentes.length) return null;

    await pool.execute(
        `UPDATE ${tabla}
         SET nivel_verificado = NULL,
             verificado_por_usuario_id = NULL,
             verificado_en = NULL
         WHERE postulante_id = ? AND ${columna} = ?`,
        [postulanteId, catalogoId]
    );

    const [resultado] = await pool.execute(
        `SELECT relacion.nivel_declarado, relacion.nivel_verificado,
                relacion.verificado_por_usuario_id,
                usuario.usuario AS verificado_por_usuario,
                relacion.verificado_en
         FROM ${tabla} relacion
         LEFT JOIN usuario ON usuario.id = relacion.verificado_por_usuario_id
         WHERE relacion.postulante_id = ? AND relacion.${columna} = ?`,
        [postulanteId, catalogoId]
    );
    return resultado[0] || null;
}

module.exports = {
    obtenerTodos,
    correoExiste,
    obtenerPorId,
    crear,
    crearPerfilCompleto,
    actualizarPerfilCompleto,
    verificarConocimiento,
    retirarVerificacionConocimiento
};
