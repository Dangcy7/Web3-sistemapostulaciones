-- Migración aditiva para solicitudes de trabajo y sus requisitos.
-- No elimina ni modifica tablas o filas existentes.

CREATE TABLE IF NOT EXISTS solicitud_trabajo (
    id INT NOT NULL AUTO_INCREMENT,
    admin_usuario_id INT NOT NULL,
    titulo VARCHAR(120) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_solicitud_trabajo_admin (admin_usuario_id),
    CONSTRAINT fk_solicitud_trabajo_admin
        FOREIGN KEY (admin_usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS solicitud_lenguaje (
    solicitud_id INT NOT NULL,
    lenguaje_id INT NOT NULL,
    importancia ENUM('indispensable', 'deseable') NOT NULL,
    PRIMARY KEY (solicitud_id, lenguaje_id),
    KEY idx_solicitud_lenguaje_catalogo (lenguaje_id),
    CONSTRAINT fk_solicitud_lenguaje_solicitud
        FOREIGN KEY (solicitud_id) REFERENCES solicitud_trabajo (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_lenguaje_catalogo
        FOREIGN KEY (lenguaje_id) REFERENCES lenguaje (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS solicitud_herramienta (
    solicitud_id INT NOT NULL,
    herramienta_id INT NOT NULL,
    importancia ENUM('indispensable', 'deseable') NOT NULL,
    PRIMARY KEY (solicitud_id, herramienta_id),
    KEY idx_solicitud_herramienta_catalogo (herramienta_id),
    CONSTRAINT fk_solicitud_herramienta_solicitud
        FOREIGN KEY (solicitud_id) REFERENCES solicitud_trabajo (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_solicitud_herramienta_catalogo
        FOREIGN KEY (herramienta_id) REFERENCES herramienta (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
