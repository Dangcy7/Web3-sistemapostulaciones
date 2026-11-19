const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const migration = fs.readFileSync(path.join(__dirname, "../../database/migrations/005_ofertas_y_candidaturas.sql"), "utf8");

test("la migración de ofertas conserva solicitudes y define estados", () => {
  assert.match(migration, /ADD COLUMN estado_publicacion ENUM\('borrador','publicada','cerrada'\) NOT NULL DEFAULT 'borrador'/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS candidatura/);
  assert.match(migration, /UNIQUE KEY uq_candidatura_solicitud_postulante \(solicitud_id, postulante_id\)/);
  assert.match(migration, /REFERENCES solicitud_trabajo \(id\)/);
  assert.match(migration, /REFERENCES postulante \(id\)/);
});

test("HTML se agrega al catálogo sin duplicar entradas", () => {
  assert.match(migration, /INSERT INTO lenguaje \(nombre\)[\s\S]*SELECT 'HTML'[\s\S]*WHERE NOT EXISTS[\s\S]*LOWER\(nombre\) = 'html'/);
});
