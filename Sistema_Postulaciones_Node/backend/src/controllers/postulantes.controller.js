
function puedeAcceder(req, idPostulante) {
    return req.usuario.rol === "admin" ||
           Number(req.usuario.postulante_id) === Number(idPostulante);
}

const postulantesService = require("../services/postulantes.service");
const { esNivelConocimientoValido } = require("../constants/niveles-conocimiento");

const CAMPOS_VERIFICACION = new Set([
    "nivel_verificado",
    "verificado_por_usuario_id",
    "verificado_en"
]);

function contieneCamposDeVerificacion(valor) {
    if (!valor || typeof valor !== "object") return false;
    if (Array.isArray(valor)) return valor.some(contieneCamposDeVerificacion);
    return Object.entries(valor).some(([campo, contenido]) =>
        CAMPOS_VERIFICACION.has(campo) || contieneCamposDeVerificacion(contenido)
    );
}

function normalizarConocimientos(lista, permitirPendientesHistoricos) {
    if (!Array.isArray(lista)) return null;
    const ids = new Set();
    const normalizados = [];

    for (const item of lista) {
        let conocimiento;
        if (Number.isSafeInteger(item) && item > 0) {
            // Compatibilidad transitoria con los formularios actuales, que solo envían IDs.
            conocimiento = { id: item, nivel_declarado: undefined, legacy: true };
        } else if (item && typeof item === "object" && !Array.isArray(item)) {
            if (Object.keys(item).some(key => !["id", "nivel_declarado"].includes(key))) return null;
            const id = Number(item.id);
            if (!Number.isSafeInteger(id) || id <= 0 || !Object.prototype.hasOwnProperty.call(item, "nivel_declarado")) return null;
            if (!esNivelConocimientoValido(item.nivel_declarado) &&
                !(permitirPendientesHistoricos && item.nivel_declarado === null)) return null;
            conocimiento = { id, nivel_declarado: item.nivel_declarado, legacy: false };
        } else {
            return null;
        }

        if (ids.has(conocimiento.id)) return null;
        ids.add(conocimiento.id);
        normalizados.push(conocimiento);
    }
    return normalizados;
}

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
        if (contieneCamposDeVerificacion(req.body)) {
            return res.status(400).json({ ok: false, mensaje: "Los campos de verificación solo pueden ser establecidos por un administrador." });
        }
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

        if (await postulantesService.correoExiste(correo.trim())) {
            return res.status(409).json({
                ok: false,
                mensaje: "Ese correo electrónico ya está registrado"
            });
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

        const lenguajesNormalizados = normalizarConocimientos(lenguajes, false);
        const herramientasNormalizadas = normalizarConocimientos(herramientas, false);
        if (!lenguajesNormalizados || !herramientasNormalizadas) {
            return res.status(400).json({
                ok: false,
                mensaje: "Cada conocimiento debe ser un ID existente o incluir un nivel declarado válido."
            });
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
            lenguajes: lenguajesNormalizados,
            herramientas: herramientasNormalizadas,
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
        if (contieneCamposDeVerificacion(req.body)) {
            return res.status(400).json({ ok: false, mensaje: "Los campos de verificación solo pueden ser establecidos por un administrador." });
        }
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

        const lenguajesNormalizados = normalizarConocimientos(lenguajes, true);
        const herramientasNormalizadas = normalizarConocimientos(herramientas, true);
        if (!lenguajesNormalizados || !herramientasNormalizadas) {
            return res.status(400).json({
                ok: false,
                mensaje: "Cada conocimiento debe tener un ID válido y un nivel declarado permitido."
            });
        }

        const actualizado = await postulantesService.actualizarPerfilCompleto(id, {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            ciudad: ciudad.trim(),
            formacion,
            experiencias,
            lenguajes: lenguajesNormalizados,
            herramientas: herramientasNormalizadas,
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

        if (error.code === "INVALID_KNOWLEDGE_LEVEL") {
            return res.status(400).json({ ok: false, mensaje: error.message });
        }
        if (error.code === "VERIFIED_KNOWLEDGE_LOCKED") {
            return res.status(409).json({ ok: false, mensaje: error.message });
        }

        res.status(500).json({
            ok: false,
            mensaje: "No se pudo actualizar el perfil"
        });
    }
}

async function verificarNivelConocimiento(req, res) {
    const postulanteId = Number(req.params.id);
    const catalogoId = Number(req.params.catalogoId);
    const { tipo } = req.params;
    const { nivel_verificado: nivel } = req.body || {};
    const adminUsuarioId = Number(req.usuario.id);

    if (!Number.isSafeInteger(postulanteId) || postulanteId <= 0 ||
        !Number.isSafeInteger(catalogoId) || catalogoId <= 0 ||
        !["lenguajes", "herramientas"].includes(tipo) ||
        !esNivelConocimientoValido(nivel) ||
        !Number.isSafeInteger(adminUsuarioId) || adminUsuarioId <= 0) {
        return res.status(400).json({ ok: false, mensaje: "Indica un perfil, conocimiento y nivel verificado válidos." });
    }

    try {
        const verificacion = await postulantesService.verificarConocimiento({
            postulanteId,
            tipo,
            catalogoId,
            nivel,
            adminUsuarioId
        });
        if (!verificacion) {
            return res.status(404).json({ ok: false, mensaje: "Ese conocimiento no está asociado al perfil." });
        }
        res.json({
            ok: true,
            mensaje: "Nivel verificado correctamente",
            datos: { postulante_id: postulanteId, tipo, catalogo_id: catalogoId, ...verificacion }
        });
    } catch (error) {
        console.error("Error al verificar el nivel de conocimiento:", error.message);
        res.status(500).json({ ok: false, mensaje: "No se pudo registrar la verificación." });
    }
}

async function retirarVerificacionNivelConocimiento(req, res) {
    const postulanteId = Number(req.params.id);
    const catalogoId = Number(req.params.catalogoId);
    const { tipo } = req.params;

    if (!Number.isSafeInteger(postulanteId) || postulanteId <= 0 ||
        !Number.isSafeInteger(catalogoId) || catalogoId <= 0 ||
        !["lenguajes", "herramientas"].includes(tipo)) {
        return res.status(400).json({ ok: false, mensaje: "Indica un perfil y conocimiento válidos." });
    }

    try {
        const resultado = await postulantesService.retirarVerificacionConocimiento({
            postulanteId,
            tipo,
            catalogoId
        });
        if (!resultado) {
            return res.status(404).json({ ok: false, mensaje: "Ese conocimiento no está asociado al perfil." });
        }

        return res.json({
            ok: true,
            mensaje: "Verificación retirada; el nivel declarado y la asociación se conservaron.",
            datos: { postulante_id: postulanteId, tipo, catalogo_id: catalogoId, ...resultado }
        });
    } catch (error) {
        console.error("Error al retirar la verificación del conocimiento:", error.message);
        return res.status(500).json({ ok: false, mensaje: "No se pudo retirar la verificación." });
    }
}

module.exports = {
    listarPostulantes,
    obtenerDetalle,
    crearPostulante,
    crearPerfilCompleto,
    actualizarPerfilCompleto,
    verificarNivelConocimiento,
    retirarVerificacionNivelConocimiento
};
