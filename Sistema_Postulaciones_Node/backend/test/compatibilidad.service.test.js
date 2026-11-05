const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluarPostulante } = require("../src/services/compatibilidad.service");

function perfil(overrides = {}) {
    return {
        id: 1,
        nombre: "Ana",
        apellido: "Prueba",
        correo: "ana@example.test",
        ciudad: "Caracas",
        disponibilidad: "disponible",
        jornadas: ["tiempo_completo"],
        modalidades: ["remoto"],
        lenguajes: [],
        herramientas: [],
        experiencias: [],
        ...overrides
    };
}

function solicitud(overrides = {}) {
    return {
        titulo: "Desarrolladora",
        tipo_contratacion: "permanente",
        jornadas: ["tiempo_completo"],
        modalidades: ["remoto"],
        lenguajes: [],
        herramientas: [],
        ...overrides
    };
}

test("usa el nivel verificado aunque el declarado sea superior", () => {
    const candidate = evaluarPostulante(perfil({ lenguajes: [{ id: 2, nivel_declarado: "experto", nivel_verificado: "basico" }] }),
        solicitud({ lenguajes: [{ id: 2, nombre: "Java", importancia: "indispensable", nivel_minimo: "avanzado" }] }));
    assert.equal(candidate.estado, "no_cumple_obligatorios");
    assert.equal(candidate.criterios.find(item => item.tipo === "lenguaje").origen_nivel, "verificado");
});

test("cuenta un nivel declarado suficiente como cumplimiento provisional", () => {
    const candidate = evaluarPostulante(perfil({ lenguajes: [{ id: 2, nivel_declarado: "experto", nivel_verificado: null }] }),
        solicitud({ lenguajes: [{ id: 2, nombre: "Java", importancia: "indispensable", nivel_minimo: "avanzado" }] }));
    assert.equal(candidate.estado, "compatible");
    assert.equal(candidate.criterios.find(item => item.tipo === "lenguaje").estado, "cumple_provisional");
});

test("marca desconocido un requisito nuevo sin asociación ni nivel", () => {
    const candidate = evaluarPostulante(perfil(),
        solicitud({ herramientas: [{ id: 4, nombre: "MySQL", importancia: "indispensable", nivel_minimo: "intermedio" }] }));
    assert.equal(candidate.estado, "informacion_insuficiente");
    assert.equal(candidate.coincidencia, null);
});

test("conserva la regla de presencia para requisitos antiguos sin nivel mínimo", () => {
    const request = solicitud({ lenguajes: [{ id: 3, nombre: "JavaScript", importancia: "indispensable", nivel_minimo: null }] });
    assert.equal(evaluarPostulante(perfil(), request).estado, "no_cumple_obligatorios");
    assert.equal(evaluarPostulante(perfil({ lenguajes: [{ id: 3, nivel_declarado: null }] }), request).estado, "compatible");
});

test("requiere una intersección de jornadas y clasifica la información ausente", () => {
    const request = solicitud({ jornadas: ["tiempo_parcial"] });
    assert.equal(evaluarPostulante(perfil(), request).estado, "no_cumple_obligatorios");
    assert.equal(evaluarPostulante(perfil({ jornadas: [] }), request).estado, "informacion_insuficiente");
});

test("requiere una intersección de modalidades", () => {
    const request = solicitud({ modalidades: ["presencial"] });
    assert.equal(evaluarPostulante(perfil(), request).estado, "no_cumple_obligatorios");
    assert.equal(evaluarPostulante(perfil({ modalidades: [] }), request).estado, "informacion_insuficiente");
});

test("mantiene por separado a postulantes no disponibles", () => {
    const candidate = evaluarPostulante(perfil({ disponibilidad: "no_disponible" }), solicitud());
    assert.equal(candidate.estado, "no_disponible");
});

test("no asume disponibilidad cuando el dato está ausente", () => {
    const candidate = evaluarPostulante(perfil({ disponibilidad: null }), solicitud());
    assert.equal(candidate.estado, "informacion_insuficiente");
});

test("un deseable desconocido reduce el porcentaje, pero no excluye", () => {
    const candidate = evaluarPostulante(perfil(), solicitud({ herramientas: [
        { id: 6, nombre: "Docker", importancia: "deseable", nivel_minimo: "basico" }
    ] }));
    assert.equal(candidate.estado, "compatible");
    assert.equal(candidate.coincidencia, 0);
    assert.equal(candidate.criterios.find(item => item.tipo === "herramienta").estado, "desconocido");
});

test("la experiencia queda disponible para evaluación humana y no se puntúa", () => {
    const candidate = evaluarPostulante(perfil({ experiencias: [{ puesto: "Desarrolladora", años_experiencia: 12 }] }), solicitud());
    assert.deepEqual(candidate.experiencia, [{ puesto: "Desarrolladora", años_experiencia: 12 }]);
    assert.equal(candidate.nota_experiencia, "La experiencia se muestra para evaluación humana; no se suman años automáticamente.");
    assert.equal(candidate.coincidencia, 100);
});
