const DISPONIBILIDADES = new Set(["disponible", "no_disponible"]);
const JORNADAS = new Set(["tiempo_completo", "tiempo_parcial"]);
const MODALIDADES = new Set(["presencial", "remoto", "hibrido"]);
const TIPOS_CONTRATACION = new Set(["permanente", "temporal", "pasantia"]);

function esListaValida(lista, opciones) {
    return Array.isArray(lista) &&
        new Set(lista).size === lista.length &&
        lista.every(valor => opciones.has(valor));
}

module.exports = {
    DISPONIBILIDADES,
    JORNADAS,
    MODALIDADES,
    TIPOS_CONTRATACION,
    esListaValida
};
