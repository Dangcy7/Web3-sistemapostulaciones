const ORDEN_NIVELES = Object.freeze({
    basico: 1,
    intermedio: 2,
    avanzado: 3,
    experto: 4
});

const ETIQUETAS = Object.freeze({
    tiempo_completo: "Tiempo completo",
    tiempo_parcial: "Tiempo parcial",
    presencial: "Presencial",
    remoto: "Remoto",
    hibrido: "Híbrido"
});

function evaluarPreferencias(tipo, aceptadas, postulante) {
    if (!Array.isArray(aceptadas) || aceptadas.length === 0) {
        return { tipo, estado: "sin_criterio", solicitadas: [], postulante: [] };
    }
    if (!Array.isArray(postulante) || postulante.length === 0) {
        return {
            tipo,
            estado: "desconocido",
            solicitadas: aceptadas,
            postulante: Array.isArray(postulante) ? postulante : []
        };
    }
    const coincidencias = aceptadas.filter(valor => postulante.includes(valor));
    return {
        tipo,
        estado: coincidencias.length ? "cumple" : "no_cumple",
        solicitadas: aceptadas,
        postulante,
        coincidencias
    };
}

function evaluarRequisitoTecnico(requisito, conocimientos, tipo) {
    const conocimiento = conocimientos.find(item => Number(item.id) === Number(requisito.id));
    const etiqueta = requisito.nombre || `${tipo} ${requisito.id}`;
    const nivelMinimo = requisito.nivel_minimo || null;

    // Las solicitudes anteriores a la migración no tenían nivel mínimo.
    // Se conserva su regla histórica: la asociación debe existir.
    if (!nivelMinimo) {
        return {
            tipo,
            requisito: etiqueta,
            importancia: requisito.importancia,
            nivel_requerido: null,
            nivel_postulante: conocimiento?.nivel_verificado || conocimiento?.nivel_declarado || null,
            origen_nivel: conocimiento?.nivel_verificado ? "verificado" : conocimiento?.nivel_declarado ? "declarado" : null,
            estado: conocimiento ? "cumple" : "no_cumple",
            explicacion: conocimiento
                ? "Requisito heredado cumplido por asociación registrada; no tenía nivel mínimo."
                : "La solicitud heredada requería la asociación y el perfil no la registra."
        };
    }

    if (!conocimiento) {
        return {
            tipo,
            requisito: etiqueta,
            importancia: requisito.importancia,
            nivel_requerido: nivelMinimo,
            nivel_postulante: null,
            origen_nivel: null,
            estado: "desconocido",
            explicacion: "El perfil no contiene información sobre este conocimiento."
        };
    }

    const verificado = Boolean(conocimiento.nivel_verificado);
    const nivel = conocimiento.nivel_verificado || conocimiento.nivel_declarado || null;
    if (!nivel || !ORDEN_NIVELES[nivel]) {
        return {
            tipo,
            requisito: etiqueta,
            importancia: requisito.importancia,
            nivel_requerido: nivelMinimo,
            nivel_postulante: null,
            origen_nivel: null,
            estado: "desconocido",
            explicacion: "La asociación existe, pero todavía no tiene un nivel declarado ni verificado."
        };
    }

    const alcanza = ORDEN_NIVELES[nivel] >= ORDEN_NIVELES[nivelMinimo];
    return {
        tipo,
        requisito: etiqueta,
        importancia: requisito.importancia,
        nivel_requerido: nivelMinimo,
        nivel_postulante: nivel,
        origen_nivel: verificado ? "verificado" : "declarado",
        estado: alcanza ? (verificado ? "cumple" : "cumple_provisional") : "no_cumple",
        explicacion: alcanza
            ? verificado
                ? "El nivel verificado alcanza el mínimo requerido."
                : "El nivel declarado alcanza el mínimo; falta verificación administrativa."
            : verificado
                ? "El nivel verificado está por debajo del mínimo; prevalece sobre el declarado."
                : "El nivel declarado está por debajo del mínimo requerido."
    };
}

function evaluarPostulante(perfil, solicitud) {
    const tecnicos = [
        ...(solicitud.lenguajes || []).map(item => evaluarRequisitoTecnico(item, perfil.lenguajes || [], "lenguaje")),
        ...(solicitud.herramientas || []).map(item => evaluarRequisitoTecnico(item, perfil.herramientas || [], "herramienta"))
    ];
    const jornada = evaluarPreferencias("jornada", solicitud.jornadas || [], perfil.jornadas || []);
    const modalidad = evaluarPreferencias("modalidad", solicitud.modalidades || [], perfil.modalidades || []);
    const disponibilidad = perfil.disponibilidad === "disponible"
        ? { tipo: "disponibilidad", estado: "cumple", postulante: perfil.disponibilidad }
        : perfil.disponibilidad === "no_disponible"
            ? { tipo: "disponibilidad", estado: "no_disponible", postulante: perfil.disponibilidad }
            : { tipo: "disponibilidad", estado: "desconocido", postulante: null };

    const criterios = [
        disponibilidad,
        { ...jornada, solicitadas: jornada.solicitadas.map(valor => ETIQUETAS[valor] || valor), postulante: jornada.postulante.map(valor => ETIQUETAS[valor] || valor) },
        { ...modalidad, solicitadas: modalidad.solicitadas.map(valor => ETIQUETAS[valor] || valor), postulante: modalidad.postulante.map(valor => ETIQUETAS[valor] || valor) },
        ...tecnicos
    ];
    const criteriosObligatorios = [
        ...tecnicos.filter(item => item.importancia === "indispensable"),
        ...(jornada.estado === "sin_criterio" ? [] : [jornada]),
        ...(modalidad.estado === "sin_criterio" ? [] : [modalidad])
    ];
    const incumplidos = criteriosObligatorios.filter(item => item.estado === "no_cumple");
    const desconocidos = criteriosObligatorios.filter(item => item.estado === "desconocido");
    const noDisponible = disponibilidad.estado === "no_disponible";
    const estado = noDisponible
        ? "no_disponible"
        : incumplidos.length
            ? "no_cumple_obligatorios"
            : disponibilidad.estado === "desconocido" || desconocidos.length
                ? "informacion_insuficiente"
                : "compatible";

    const deseables = tecnicos.filter(item => item.importancia === "deseable");
    const deseablesCumplidos = deseables.filter(item => item.estado === "cumple" || item.estado === "cumple_provisional").length;
    const coincidencia = deseables.length
        ? Math.round((deseablesCumplidos / deseables.length) * 100)
        : estado === "compatible" ? 100 : null;

    return {
        id: perfil.id,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        correo: perfil.correo,
        ciudad: perfil.ciudad,
        disponibilidad: perfil.disponibilidad || "desconocida",
        tipo_contratacion: solicitud.tipo_contratacion || null,
        coincidencia,
        deseablesCumplidos,
        totalDeseables: deseables.length,
        estado,
        criterios,
        experiencia: perfil.experiencias || [],
        nota_experiencia: "La experiencia se muestra para evaluación humana; no se suman años automáticamente."
    };
}

function ordenarCandidatos(candidatos) {
    return candidatos.sort((a, b) => (b.coincidencia ?? -1) - (a.coincidencia ?? -1) ||
        `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es"));
}

module.exports = { evaluarPostulante, ordenarCandidatos, ORDEN_NIVELES };
