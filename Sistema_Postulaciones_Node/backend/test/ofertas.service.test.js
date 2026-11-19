const test = require("node:test");
const assert = require("node:assert/strict");
const pool = require("../src/config/database");
const service = require("../src/services/solicitudes.service");
const postulantesService = require("../src/services/postulantes.service");

function installConnection({ offerState = "publicada", duplicate = false } = {}) {
  const calls = [];
  const connection = {
    async beginTransaction() { calls.push(["BEGIN"]); },
    async commit() { calls.push(["COMMIT"]); },
    async rollback() { calls.push(["ROLLBACK"]); },
    release() { calls.push(["RELEASE"]); },
    async execute(sql, params = []) {
      calls.push([sql, params]);
      if (/SELECT id FROM solicitud_trabajo/.test(sql)) return [[{ id: 42 }]];
      if (/SELECT estado_publicacion/.test(sql)) return [offerState ? [{ estado_publicacion: offerState }] : []];
      if (/SELECT id FROM postulante/.test(sql)) return [[{ id: params[0] }]];
      if (/INSERT INTO candidatura/.test(sql)) {
        if (duplicate) throw Object.assign(new Error("duplicate"), { code: "ER_DUP_ENTRY" });
        return [{ insertId: 17 }];
      }
      return [{ affectedRows: 1 }];
    }
  };
  pool.getConnection = async () => connection;
  pool.execute = async (sql, params = []) => {
    calls.push([sql, params]);
    if (/SELECT id FROM lenguaje/.test(sql)) return [params.map(id => ({ id }))];
    if (/SELECT id FROM herramienta/.test(sql)) return [params.map(id => ({ id }))];
    return [[], {}];
  };
  return calls;
}

test("edita oferta y sincroniza los cuatro grupos de relaciones en una transacción", async () => {
  const calls = installConnection();
  const updated = await service.actualizarSolicitud(42, {
    titulo: "Oferta", descripcion: "Descripción", tipo_contratacion: "permanente",
    lenguajes: [{ id: 1, importancia: "indispensable", nivel_minimo: null }],
    herramientas: [{ id: 2, importancia: "indispensable", nivel_minimo: null }],
    jornadas: ["tiempo_completo"], modalidades: ["remoto"]
  });
  assert.equal(updated, true);
  const sql = calls.map(call => call[0]).join("\n");
  assert.match(sql, /DELETE FROM solicitud_lenguaje/);
  assert.match(sql, /DELETE FROM solicitud_herramienta/);
  assert.match(sql, /DELETE FROM solicitud_jornada/);
  assert.match(sql, /DELETE FROM solicitud_modalidad/);
  assert.match(sql, /INSERT INTO solicitud_lenguaje/);
  assert.match(sql, /INSERT INTO solicitud_herramienta/);
  assert.match(sql, /INSERT INTO solicitud_jornada/);
  assert.match(sql, /INSERT INTO solicitud_modalidad/);
  assert.ok(calls.some(call => call[0] === "COMMIT"));
  assert.ok(!/DELETE FROM candidatura/.test(sql));
  assert.ok(!/estado_publicacion\s*=/.test(sql));
});

test("postularse usa el perfil recibido desde sesión y crea la candidatura con esa identidad", async () => {
  const calls = installConnection();
  const result = await service.postularse(42, 8);
  assert.deepEqual(result, { id: 17 });
  const insert = calls.find(([sql]) => /INSERT INTO candidatura/.test(sql));
  assert.deepEqual(insert[1], [42, 8]);
  assert.ok(calls.some(call => call[0] === "COMMIT"));
});

test("una oferta cerrada no recibe candidaturas y un duplicado conserva respuesta diferenciada", async () => {
  installConnection({ offerState: "cerrada" });
  assert.deepEqual(await service.postularse(42, 8), { error: "CLOSED" });
  installConnection({ duplicate: true });
  assert.deepEqual(await service.postularse(42, 8), { error: "DUPLICATE" });
});

test("mis candidaturas siempre filtra por el postulante de sesión proporcionado por backend", async () => {
  let captured;
  pool.execute = async (sql, params) => { captured = { sql, params }; return [[{ id: 1 }]]; };
  await service.misCandidaturas(8);
  assert.match(captured.sql, /WHERE c\.postulante_id = \?/);
  assert.deepEqual(captured.params, [8]);
});

test("el buscador aplica los filtros en la consulta antes de cargar perfiles completos", async () => {
  const queries = [];
  pool.execute = async (sql, params) => {
    queries.push({ sql, params });
    if (/SELECT p\.id FROM postulante/.test(sql)) return [[{ id: 3 }]];
    if (/SELECT id, nombre, apellido, telefono, correo, ciudad, disponibilidad/.test(sql)) return [[{ id: 3, nombre: "Ana", apellido: "Prueba", disponibilidad: "disponible" }]];
    if (/SELECT jornada FROM postulante_jornada/.test(sql)) return [[{ jornada: "tiempo_completo" }]];
    if (/SELECT modalidad FROM postulante_modalidad/.test(sql)) return [[{ modalidad: "remoto" }]];
    if (/FROM lenguaje l/.test(sql)) return [[{ id: 1, nombre: "Python" }]];
    if (/FROM herramienta h/.test(sql)) return [[{ id: 2, nombre: "Git" }]];
    return [[]];
  };
  const result = await postulantesService.buscarPostulantes({ lenguajes: [1], herramientas: [2], soloDisponibles: true, jornadas: ["tiempo_completo"], modalidades: ["remoto"] });
  assert.equal(result.length, 1);
  assert.match(queries[0].sql, /EXISTS \(SELECT 1 FROM postulante_lenguaje/);
  assert.match(queries[0].sql, /EXISTS \(SELECT 1 FROM postulante_herramienta/);
  assert.match(queries[0].sql, /postulante_jornada/);
  assert.match(queries[0].sql, /postulante_modalidad/);
  assert.equal(queries.length, 9); // Filtro IDs y las ocho consultas del perfil que sobrevivió.
});
