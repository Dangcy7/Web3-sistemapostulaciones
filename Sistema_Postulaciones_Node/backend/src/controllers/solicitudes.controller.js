const solicitudesService = require("../services/solicitudes.service");
const { esNivelConocimientoValido } = require("../constants/niveles-conocimiento");
const { JORNADAS, MODALIDADES, TIPOS_CONTRATACION, esListaValida } = require("../constants/criterios-laborales");

function validarListaRequisitos(lista) {
    if (!Array.isArray(lista)) return false;
    const ids = new Set();
    return lista.every(item => {
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        const id = Number(item.id);
        if (!Number.isSafeInteger(id) || id <= 0 || ids.has(id)) return false;
        if (Object.prototype.hasOwnProperty.call(item, "importancia") && !solicitudesService.IMPORTANCIAS.has(item.importancia)) return false;
        if (Object.prototype.hasOwnProperty.call(item, "nivel_minimo") && item.nivel_minimo !== null && !esNivelConocimientoValido(item.nivel_minimo)) return false;
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
        const { titulo, descripcion, tipo_contratacion, jornadas, modalidades, lenguajes, herramientas, estado_publicacion } = req.body;
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
            lenguajes: lenguajes.map(item => ({ id: Number(item.id), importancia: item.importancia || "indispensable", nivel_minimo: item.nivel_minimo ?? null })),
            herramientas: herramientas.map(item => ({ id: Number(item.id), importancia: item.importancia || "indispensable", nivel_minimo: item.nivel_minimo ?? null })),
            estado_publicacion: estado_publicacion === "publicada" ? "publicada" : "borrador"
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

async function publicadas(req, res) {
    try { const datos = await solicitudesService.listarPublicadas(); res.json({ ok: true, datos }); }
    catch (error) { console.error(error.message); res.status(500).json({ ok: false, mensaje: "No se pudieron consultar las ofertas." }); }
}

async function postular(req, res) {
    const ofertaId = Number(req.params.id), postulanteId = Number(req.usuario.postulante_id);
    if (!Number.isSafeInteger(ofertaId) || ofertaId <= 0 || !Number.isSafeInteger(postulanteId) || postulanteId <= 0)
        return res.status(403).json({ ok: false, mensaje: "La sesión no corresponde a un perfil de postulante válido." });
    try {
        const result = await solicitudesService.postularse(ofertaId, postulanteId);
        const errors = { NOT_FOUND: [404, "La oferta no existe."], CLOSED: [409, "La oferta ya no acepta candidaturas."], DUPLICATE: [409, "Ya tienes una candidatura registrada para esta oferta."], PROFILE_NOT_FOUND: [404, "No se encontró tu perfil de postulante."] };
        if (result.error) return res.status(errors[result.error][0]).json({ ok: false, mensaje: errors[result.error][1] });
        res.status(201).json({ ok: true, mensaje: "Candidatura registrada correctamente.", datos: result });
    } catch (error) { console.error(error.message); res.status(500).json({ ok: false, mensaje: "No se pudo registrar la candidatura." }); }
}

async function mias(req, res) {
    try { res.json({ ok: true, datos: await solicitudesService.misCandidaturas(Number(req.usuario.postulante_id)) }); }
    catch (error) { console.error(error.message); res.status(500).json({ ok: false, mensaje: "No se pudieron consultar tus candidaturas." }); }
}

async function estado(req, res) {
    const id = Number(req.params.id), value = req.body.estado;
    if (!Number.isSafeInteger(id) || id <= 0 || !["borrador", "publicada", "cerrada"].includes(value)) return res.status(400).json({ ok: false, mensaje: "Estado de oferta inválido." });
    try { if (!(await solicitudesService.cambiarEstado(id, value))) return res.status(404).json({ ok: false, mensaje: "Oferta no encontrada." }); res.json({ ok: true }); }
    catch (error) { console.error(error.message); res.status(500).json({ ok: false, mensaje: "No se pudo actualizar la oferta." }); }
}

async function actualizar(req, res) {
    const id = Number(req.params.id), { titulo, descripcion } = req.body || {};
    if (!Number.isSafeInteger(id) || id <= 0 || typeof titulo !== "string" || !titulo.trim() || titulo.trim().length > 120 || typeof descripcion !== "string" || !descripcion.trim() || descripcion.trim().length > 500)
        return res.status(400).json({ ok: false, mensaje: "El título y la descripción son obligatorios (máximo 120 y 500 caracteres)." });
    try {
        if (!(await solicitudesService.actualizarSolicitud(id, { titulo: titulo.trim(), descripcion: descripcion.trim() }))) return res.status(404).json({ ok: false, mensaje: "Oferta no encontrada." });
        res.json({ ok: true, mensaje: "Oferta actualizada." });
    } catch (error) { console.error(error.message); res.status(500).json({ ok: false, mensaje: "No se pudo actualizar la oferta." }); }
}

async function candidaturas(req, res) {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ ok: false, mensaje: "Identificador inválido." });
    try { res.json({ ok: true, datos: await solicitudesService.listarCandidaturas(id) }); }
    catch (error) { console.error(error.message); res.status(500).json({ ok: false, mensaje: "No se pudieron consultar las candidaturas." }); }
}

async function estadoCandidatura(req, res) {
    const id = Number(req.params.id), estado = req.body.estado;
    if (!Number.isSafeInteger(id) || id <= 0 || !["pendiente", "en_revision", "aceptada", "rechazada"].includes(estado)) return res.status(400).json({ ok: false, mensaje: "Estado de candidatura inválido." });
    try { if (!(await solicitudesService.cambiarEstadoCandidatura(id, estado))) return res.status(404).json({ ok: false, mensaje: "Candidatura no encontrada." }); res.json({ ok: true }); }
    catch (error) { console.error(error.message); res.status(500).json({ ok: false, mensaje: "No se pudo actualizar la candidatura." }); }
}

module.exports = { listar, crear, coincidencias, publicadas, postular, mias, estado, actualizar, candidaturas, estadoCandidatura };
