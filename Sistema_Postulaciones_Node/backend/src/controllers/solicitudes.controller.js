const solicitudesService = require("../services/solicitudes.service");
const { esNivelConocimientoValido } = require("../constants/niveles-conocimiento");
const { JORNADAS, MODALIDADES, TIPOS_CONTRATACION, esListaValida } = require("../constants/criterios-laborales");

function validarListaRequisitos(lista) {
    if (!Array.isArray(lista)) return false;
    const ids = new Set();
    return lista.every(item => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        const id = Number(item.id);
        if (!Number.isSafeInteger(id) || id <= 0 || !solicitudesService.IMPORTANCIAS.has(item.importancia) || ids.has(id)) return false;
        if (!Object.prototype.hasOwnProperty.call(item, "nivel_minimo") || !esNivelConocimientoValido(item.nivel_minimo)) return false;
        ids.add(id);
        return true;
    });
}

async function listar(req, res) {
    try {
        const solicitudes = await solicitudesService.listarSolicitudes();
        res.json({ ok: true, total: solicitudes.length, datos: solicitudes });
    } catch (error) {
        console.error("Error al consultar solicitudes de trabajo:", error.message);
        res.status(500).json({ ok: false, mensaje: "No se pudieron consultar las solicitudes" });
    }
}

async function crear(req, res) {
    try {
        const { titulo, descripcion, tipo_contratacion, jornadas, modalidades, lenguajes, herramientas } = req.body;
        if (typeof titulo !== "string" || !titulo.trim() || titulo.trim().length > 120 ||
            typeof descripcion !== "string" || !descripcion.trim() || descripcion.trim().length > 500) {
            return res.status(400).json({ ok: false, mensaje: "Ingresa un título y una descripción (máximo 120 y 500 caracteres)." });
        }
        if (!validarListaRequisitos(lenguajes) || !validarListaRequisitos(herramientas)) {
            return res.status(400).json({ ok: false, mensaje: "Revisa los requisitos: selecciona elementos únicos del catálogo y clasifícalos como indispensables o deseables." });
        }
        if (!TIPOS_CONTRATACION.has(tipo_contratacion) ||
            !esListaValida(jornadas, JORNADAS) || jornadas.length === 0 ||
            !esListaValida(modalidades, MODALIDADES) || modalidades.length === 0) {
            return res.status(400).json({ ok: false, mensaje: "Indica el tipo de contratación y al menos una jornada y modalidad aceptadas." });
        }
        if (lenguajes.length + herramientas.length === 0) {
            return res.status(400).json({ ok: false, mensaje: "Añade al menos un requisito de lenguaje o herramienta." });
        }
        const adminUsuarioId = Number(req.usuario.id);
        if (!Number.isSafeInteger(adminUsuarioId) || adminUsuarioId <= 0) {
            return res.status(403).json({ ok: false, mensaje: "La sesión administradora no contiene un identificador válido." });
        }

        const datos = await solicitudesService.crearSolicitud({
            adminUsuarioId,
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            tipo_contratacion,
            jornadas,
            modalidades,
            lenguajes: lenguajes.map(item => ({ id: Number(item.id), importancia: item.importancia, nivel_minimo: item.nivel_minimo ?? null })),
            herramientas: herramientas.map(item => ({ id: Number(item.id), importancia: item.importancia, nivel_minimo: item.nivel_minimo ?? null }))
        });
        res.status(201).json({ ok: true, mensaje: "Solicitud creada correctamente", datos });
    } catch (error) {
        if (error.code === "INVALID_CATALOG_ITEM") {
            return res.status(400).json({ ok: false, mensaje: error.message });
        }
        if (error.code === "INVALID_KNOWLEDGE_LEVEL") {
            return res.status(400).json({ ok: false, mensaje: error.message });
        }
        console.error("Error al crear solicitud de trabajo:", error.message);
        res.status(500).json({ ok: false, mensaje: "No se pudo crear la solicitud" });
    }
}

async function coincidencias(req, res) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ ok: false, mensaje: "El identificador debe ser un entero positivo." });
    }
    try {
        const resultado = await solicitudesService.obtenerCoincidencias(id);
        if (!resultado) return res.status(404).json({ ok: false, mensaje: "Solicitud no encontrada." });
        res.json({ ok: true, datos: resultado });
    } catch (error) {
        console.error("Error al calcular coincidencias:", error.message);
        res.status(500).json({ ok: false, mensaje: "No se pudieron calcular las coincidencias." });
    }
}

module.exports = { listar, crear, coincidencias };
