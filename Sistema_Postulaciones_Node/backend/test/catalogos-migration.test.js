const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const migrationPath = path.join(__dirname, "../../database/migrations/004_ampliacion_catalogos_conocimientos.sql");
const migration = fs.readFileSync(migrationPath, "utf8");

function valuesFor(table) {
    const start = migration.indexOf(`INSERT INTO ${table} (nombre)`);
    const end = migration.indexOf(") AS nuevos", start);
    assert.notEqual(start, -1, `No existe bloque para ${table}`);
    assert.notEqual(end, -1, `Bloque incompleto para ${table}`);
    return [...migration.slice(start, end).matchAll(/SELECT '([^']+)'/g)].map(match => match[1]);
}

test("la migración agrega los lenguajes que faltan y omite los existentes", () => {
    const names = valuesFor("lenguaje");
    for (const name of ["C", "C#", "TypeScript", "Ruby", "Go", "Rust", "Kotlin", "Swift", "Dart", "R", "SQL"]) {
        assert.ok(names.includes(name), `Falta el lenguaje ${name}`);
    }
    for (const existing of ["Python", "Java", "JavaScript", "C++", "PHP"]) assert.ok(!names.includes(existing));
});

test("la migración agrega tecnologías faltantes y omite las ya registradas", () => {
    const names = valuesFor("herramienta");
    for (const name of [
        "Angular", "Vue.js", "Svelte", "Spring Boot", "Laravel", "Django", "Express.js", ".NET",
        "PostgreSQL", "MongoDB", "SQLite", "Redis", "MariaDB", "GitLab", "Linux", "Postman",
        "AWS", "Microsoft Azure", "Google Cloud", "Kubernetes", "Figma", "Adobe Photoshop",
        "Adobe Illustrator", "Adobe XD"
    ]) assert.ok(names.includes(name), `Falta la tecnología ${name}`);
    for (const existing of ["Git", "GitHub", "Docker", "MySQL", "React", "Node.js", "Flask"]) assert.ok(!names.includes(existing));
});

test("la migración comprueba el nombre antes de insertar y se puede repetir", () => {
    assert.equal((migration.match(/WHERE NOT EXISTS/g) || []).length, 2);
});
