
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

// Obtener el perfil completo de un postulante
async function obtenerPorId(id) {
    const [postulantes] = await pool.execute(
        `SELECT id, nombre, apellido, telefono, correo, ciudad
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
        `SELECT l.id, l.nombre
         FROM lenguaje l
         INNER JOIN postulante_lenguaje pl
             ON pl.lenguaje_id = l.id
         WHERE pl.postulante_id = ?`,
        [id]
    );

    const [herramientas] = await pool.execute(
        `SELECT h.id, h.nombre
         FROM herramienta h
         INNER JOIN postulante_herramienta ph
             ON ph.herramienta_id = h.id
         WHERE ph.postulante_id = ?`,
        [id]
    );

    return {
        ...postulante,
        formacion,
        experiencias,
        lenguajes,
        herramientas,
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
        for (const lenguajeId of lenguajes) {
            await conexion.execute(
                `INSERT INTO postulante_lenguaje
                    (postulante_id, lenguaje_id)
                 VALUES (?, ?)`,
                [postulanteId, lenguajeId]
            );
        }

        // 6. Registrar herramientas
        for (const herramientaId of herramientas) {
            await conexion.execute(
                `INSERT INTO postulante_herramienta
                    (postulante_id, herramienta_id)
                 VALUES (?, ?)`,
                [postulanteId, herramientaId]
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
            proyectos = []
        } = datos;

        // 1. Actualizar datos personales
        const [resultado] = await conexion.execute(
            `UPDATE postulante
             SET nombre = ?, apellido = ?, telefono = ?,
                 correo = ?, ciudad = ?
             WHERE id = ?`,
            [nombre, apellido, telefono, correo, ciudad, id]
        );

        if (resultado.affectedRows === 0) {
            await conexion.rollback();
            return false;
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

        await conexion.execute(
            `DELETE FROM postulante_lenguaje WHERE postulante_id = ?`, [id]
        );

        await conexion.execute(
            `DELETE FROM postulante_herramienta WHERE postulante_id = ?`, [id]
        );

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

        // 5. Actualizar lenguajes
        for (const lenguajeId of lenguajes) {
            await conexion.execute(
                `INSERT INTO postulante_lenguaje
                    (postulante_id, lenguaje_id)
                 VALUES (?, ?)`,
                [id, lenguajeId]
            );
        }

        // 6. Actualizar herramientas
        for (const herramientaId of herramientas) {
            await conexion.execute(
                `INSERT INTO postulante_herramienta
                    (postulante_id, herramienta_id)
                 VALUES (?, ?)`,
                [id, herramientaId]
            );
        }

        // 7. Registrar nuevamente los proyectos
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

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    crearPerfilCompleto,
    actualizarPerfilCompleto
};