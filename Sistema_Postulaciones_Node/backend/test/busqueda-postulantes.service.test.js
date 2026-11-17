const test = require("node:test");
const assert = require("node:assert/strict");
const { filtrarYOrdenarPostulantes } = require("../src/services/busqueda-postulantes.service");
const postulantesController = require("../src/controllers/postulantes.controller");
const postulantesService = require("../src/services/postulantes.service");
const solicitudesService = require("../src/services/solicitudes.service");

const persona = (nombre, overrides = {}) => ({
    id: nombre,
    nombre,
    apellido: "Prueba",
    disponibilidad: "disponible",
    lenguajes: [],
    herramientas: [],
    jornadas: [],
    modalidades: [],
    ...overrides
});

const filtros = (overrides = {}) => ({
    lenguajes: [],
    herramientas: [],
    soloDisponibles: false,
    jornadas: [],
    modalidades: [],
    ...overrides
});

test("ordena primero perfiles con todos los lenguajes seleccionados", () => {
    const profiles = [
        persona("Java", { lenguajes: [{ id: 1 }] }),
        persona("Ambos", { lenguajes: [{ id: 1 }, { id: 2 }] })
    ];
    const result = filtrarYOrdenarPostulantes(profiles, filtros({ lenguajes: [1, 2] }));
    assert.deepEqual(result.map(item => item.nombre), ["Ambos", "Java"]);
    assert.equal("conocimientosCoincidentes" in result[0], false);
});

test("incluye coincidencias técnicas parciales, pero no perfiles sin ninguna", () => {
    const profiles = [
        persona("Ninguno"),
        persona("Solo Java", { lenguajes: [{ id: 1 }] }),
        persona("Java y Python", { lenguajes: [{ id: 1 }, { id: 2 }] })
    ];
    const result = filtrarYOrdenarPostulantes(profiles, filtros({ lenguajes: [1, 2] }));
    assert.deepEqual(result.map(item => item.nombre), ["Java y Python", "Solo Java"]);
});

test("el filtro de disponibles excluye estados no disponibles y desconocidos", () => {
    const profiles = [
        persona("Sí", { disponibilidad: "disponible" }),
        persona("No", { disponibilidad: "no_disponible" }),
        persona("Desconocida", { disponibilidad: null })
    ];
    assert.deepEqual(filtrarYOrdenarPostulantes(profiles, filtros({ soloDisponibles: true })).map(item => item.nombre), ["Sí"]);
    assert.equal(filtrarYOrdenarPostulantes(profiles, filtros()).length, 3);
});

test("sin conocimientos seleccionados devuelve perfiles aunque no tengan conocimientos", () => {
    const result = filtrarYOrdenarPostulantes([persona("Vacío")], filtros());
    assert.deepEqual(result.map(item => item.nombre), ["Vacío"]);
});

test("jornada y modalidad no restringen si no se seleccionan", () => {
    const profiles = [persona("Sin preferencias")];
    assert.equal(filtrarYOrdenarPostulantes(profiles, filtros()).length, 1);
});

test("jornada y modalidad aplican intersección de opciones seleccionadas", () => {
    const profiles = [
        persona("Ambas", { jornadas: ["tiempo_completo"], modalidades: ["remoto"] }),
        persona("Sin jornada", { jornadas: ["tiempo_parcial"], modalidades: ["remoto"] }),
        persona("Sin modalidad", { jornadas: ["tiempo_completo"], modalidades: ["presencial"] })
    ];
    const result = filtrarYOrdenarPostulantes(profiles, filtros({
        jornadas: ["tiempo_completo"], modalidades: ["remoto"]
    }));
    assert.deepEqual(result.map(item => item.nombre), ["Ambas"]);
});

test("devuelve lista vacía cuando ningún perfil satisface los filtros", () => {
    const profiles = [persona("Java", { lenguajes: [{ id: 1 }] })];
    assert.deepEqual(filtrarYOrdenarPostulantes(profiles, filtros({ lenguajes: [2] })), []);
});

test("la búsqueda no crea solicitudes ni invoca el servicio de solicitudes", async () => {
    const previousValidate = postulantesService.validarCatalogosConocimientos;
    const previousSearch = postulantesService.buscarPostulantes;
    const previousCreate = solicitudesService.crearSolicitud;
    let searchCalls = 0;
    let createCalls = 0;
    postulantesService.validarCatalogosConocimientos = async () => true;
    postulantesService.buscarPostulantes = async () => { searchCalls += 1; return []; };
    solicitudesService.crearSolicitud = async () => { createCalls += 1; };
    const response = {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; }
    };
    try {
        await postulantesController.buscarPostulantes({ body: {
            lenguajes: [], herramientas: [], solo_disponibles: false, jornadas: [], modalidades: []
        } }, response);
        assert.equal(response.statusCode, 200);
        assert.equal(searchCalls, 1);
        assert.equal(createCalls, 0);
    } finally {
        postulantesService.validarCatalogosConocimientos = previousValidate;
        postulantesService.buscarPostulantes = previousSearch;
        solicitudesService.crearSolicitud = previousCreate;
    }
});
