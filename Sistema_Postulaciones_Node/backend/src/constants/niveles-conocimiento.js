const NIVELES_CONOCIMIENTO = Object.freeze([
    "basico",
    "intermedio",
    "avanzado",
    "experto"
]);

const nivelesConocimientoSet = new Set(NIVELES_CONOCIMIENTO);

function esNivelConocimientoValido(nivel) {
    return nivelesConocimientoSet.has(nivel);
}

module.exports = {
    NIVELES_CONOCIMIENTO,
    esNivelConocimientoValido
};
