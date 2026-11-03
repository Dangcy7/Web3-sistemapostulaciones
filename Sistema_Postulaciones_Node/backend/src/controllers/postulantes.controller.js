
function puedeAcceder(req, idPostulante) {
    return req.usuario.rol === "admin" ||
           Number(req.usuario.postulante_id) === Number(idPostulante);
}

const postulantesService = require("../services/postulantes.service");

async function listarPostulantes(req, res) {
    try {
        const postulantes = await postulantesService.obtenerTodos();

        res.json({
            ok: true,
            total: postulantes.length,
            datos: postulantes
        });
    } catch (error) {
        console.error("Error al consultar postulantes:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "No se pudieron consultar los postulantes"
        });
    }
}



async function obtenerDetalle(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El identificador debe ser un entero positivo"
            });
        }

        const postulante = await postulantesService.obtenerPorId(id);

        if (!postulante) {
            return res.status(404).json({
                ok: false,
                mensaje: "Postulante no encontrado"
            });
        }

        if (!puedeAcceder(req, id)) {
            return res.status(403).json({
                ok: false,
                mensaje: "No tienes permiso para consultar este perfil"
            });
        }

        res.json({
            ok: true,
            datos: postulante
        });
    } catch (error) {
        console.error("Error al consultar el perfil:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo consultar el perfil"
        });
    }
}

async function crearPostulante(req, res) {
    try {
        const { nombre, apellido, telefono, correo, ciudad } = req.body;

        const campos = { nombre, apellido, telefono, correo, ciudad };

        for (const [campo, valor] of Object.entries(campos)) {
            if (typeof valor !== "string" || !valor.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El campo ${campo} es obligatorio y debe ser texto`
                });
            }
        }

        const nuevo = await postulantesService.crear({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            ciudad: ciudad.trim()
        });

        res.status(201).json({
            ok: true,
            mensaje: "Postulante registrado correctamente",
            datos: nuevo
        });
    } catch (error) {
        console.error("Error al registrar postulante:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo registrar el postulante"
        });
    }
}

async function crearPerfilCompleto(req, res) {
    try {
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
        } = req.body;

        // Validar datos personales
        const campos = { nombre, apellido, telefono, correo, ciudad };

        for (const [campo, valor] of Object.entries(campos)) {
            if (typeof valor !== "string" || !valor.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El campo ${campo} es obligatorio y debe ser texto`
                });
            }
        }

        // Validar credenciales
        if (
            typeof usuario !== "string" || !usuario.trim() ||
            typeof contraseña !== "string" || contraseña.length < 8
        ) {
            return res.status(400).json({
                ok: false,
                mensaje: "Debes ingresar un usuario y una contraseña de al menos 8 caracteres"
            });
        }

        // Validar colecciones profesionales
        const colecciones = {
            formacion,
            experiencias,
            lenguajes,
            herramientas,
            proyectos
        };

        for (const [campo, valor] of Object.entries(colecciones)) {
            if (!Array.isArray(valor)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El campo ${campo} debe ser un arreglo`
                });
            }
        }

        // Registrar perfil y cuenta
        const postulanteId = await postulantesService.crearPerfilCompleto({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            ciudad: ciudad.trim(),
            usuario: usuario.trim(),
            contraseña,
            formacion,
            experiencias,
            lenguajes,
            herramientas,
            proyectos
        });

        // Recuperar perfil
        const nuevo = await postulantesService.obtenerPorId(postulanteId);

        res.status(201).json({
            ok: true,
            mensaje: "Perfil y cuenta registrados correctamente",
            datos: nuevo
        });

    } catch (error) {
        console.error("Error al registrar el perfil completo:", error.message);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                ok: false,
                mensaje: "Ese nombre de usuario ya está registrado"
            });
        }

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo registrar el perfil completo"
        });
    }
}

async function actualizarPerfilCompleto(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                ok: false,
                mensaje: "El identificador debe ser un entero positivo"
            });
        }

        const {
            nombre,
            apellido,
            telefono,
            correo,
            ciudad,
            formacion,
            experiencias,
            lenguajes,
            herramientas,
            proyectos
        } = req.body;

        const existente = await postulantesService.obtenerPorId(id);

        if (!existente) {
            return res.status(404).json({
                ok: false,
                mensaje: "Postulante no encontrado"
            });
        }

        if (!puedeAcceder(req, id)) {
            return res.status(403).json({
                ok: false,
                mensaje: "No tienes permiso para modificar este perfil"
            });
        }

        // Validar datos personales
        const campos = { nombre, apellido, telefono, correo, ciudad };

        for (const [campo, valor] of Object.entries(campos)) {
            if (typeof valor !== "string" || !valor.trim()) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El campo ${campo} es obligatorio y debe ser texto`
                });
            }
        }

        // Validar arreglos profesionales
        const colecciones = {
            formacion,
            experiencias,
            lenguajes,
            herramientas,
            proyectos
        };

        for (const [campo, valor] of Object.entries(colecciones)) {
            if (!Array.isArray(valor)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `El campo ${campo} debe ser un arreglo`
                });
            }
        }

        const actualizado = await postulantesService.actualizarPerfilCompleto(id, {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            ciudad: ciudad.trim(),
            formacion,
            experiencias,
            lenguajes,
            herramientas,
            proyectos
        });

        if (!actualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Postulante no encontrado"
            });
        }

        const perfil = await postulantesService.obtenerPorId(id);

        res.json({
            ok: true,
            mensaje: "Perfil actualizado correctamente",
            datos: perfil
        });

    } catch (error) {
        console.error("Error al actualizar el perfil:", error.message);

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo actualizar el perfil"
        });
    }
}

module.exports = {
    listarPostulantes,
    obtenerDetalle,
    crearPostulante,
    crearPerfilCompleto,
    actualizarPerfilCompleto
};