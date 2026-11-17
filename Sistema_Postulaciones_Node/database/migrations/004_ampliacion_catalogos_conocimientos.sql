-- Amplía los catálogos compartidos por registro, edición y búsqueda.
-- La comprobación por nombre evita duplicados al volver a ejecutar la migración.

INSERT INTO lenguaje (nombre)
SELECT nuevos.nombre
FROM (
    SELECT 'C' AS nombre
    UNION ALL SELECT 'C#'
    UNION ALL SELECT 'TypeScript'
    UNION ALL SELECT 'Ruby'
    UNION ALL SELECT 'Go'
    UNION ALL SELECT 'Rust'
    UNION ALL SELECT 'Kotlin'
    UNION ALL SELECT 'Swift'
    UNION ALL SELECT 'Dart'
    UNION ALL SELECT 'R'
    UNION ALL SELECT 'SQL'
) AS nuevos
WHERE NOT EXISTS (
    SELECT 1 FROM lenguaje existente
    WHERE TRIM(existente.nombre) = TRIM(nuevos.nombre)
);

INSERT INTO herramienta (nombre)
SELECT nuevos.nombre
FROM (
    SELECT 'Angular' AS nombre
    UNION ALL SELECT 'Vue.js'
    UNION ALL SELECT 'Svelte'
    UNION ALL SELECT 'Spring Boot'
    UNION ALL SELECT 'Laravel'
    UNION ALL SELECT 'Django'
    UNION ALL SELECT 'Express.js'
    UNION ALL SELECT '.NET'
    UNION ALL SELECT 'PostgreSQL'
    UNION ALL SELECT 'MongoDB'
    UNION ALL SELECT 'SQLite'
    UNION ALL SELECT 'Redis'
    UNION ALL SELECT 'MariaDB'
    UNION ALL SELECT 'GitLab'
    UNION ALL SELECT 'Linux'
    UNION ALL SELECT 'Postman'
    UNION ALL SELECT 'AWS'
    UNION ALL SELECT 'Microsoft Azure'
    UNION ALL SELECT 'Google Cloud'
    UNION ALL SELECT 'Kubernetes'
    UNION ALL SELECT 'Figma'
    UNION ALL SELECT 'Adobe Photoshop'
    UNION ALL SELECT 'Adobe Illustrator'
    UNION ALL SELECT 'Adobe XD'
) AS nuevos
WHERE NOT EXISTS (
    SELECT 1 FROM herramienta existente
    WHERE TRIM(existente.nombre) = TRIM(nuevos.nombre)
);
