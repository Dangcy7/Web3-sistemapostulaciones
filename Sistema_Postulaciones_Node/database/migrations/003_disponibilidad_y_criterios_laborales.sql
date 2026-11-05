-- Extiende perfiles y solicitudes sin eliminar ni reemplazar información.
-- Requiere 001_solicitudes_trabajo.sql y 002_niveles_conocimiento.sql.

ALTER TABLE postulante
    ADD COLUMN disponibilidad ENUM('disponible', 'no_disponible') NULL DEFAULT NULL;

CREATE TABLE postulante_jornada (
    postulante_id INT(11) NOT NULL,
    jornada ENUM('tiempo_completo', 'tiempo_parcial') NOT NULL,
    PRIMARY KEY (postulante_id, jornada),
    CONSTRAINT fk_postulante_jornada_postulante
        FOREIGN KEY (postulante_id) REFERENCES postulante (id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE postulante_modalidad (
    postulante_id INT(11) NOT NULL,
    modalidad ENUM('presencial', 'remoto', 'hibrido') NOT NULL,
    PRIMARY KEY (postulante_id, modalidad),
    CONSTRAINT fk_postulante_modalidad_postulante
        FOREIGN KEY (postulante_id) REFERENCES postulante (id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE solicitud_trabajo
    ADD COLUMN tipo_contratacion ENUM('permanente', 'temporal', 'pasantia') NULL DEFAULT NULL;

CREATE TABLE solicitud_jornada (
    solicitud_id INT(11) NOT NULL,
    jornada ENUM('tiempo_completo', 'tiempo_parcial') NOT NULL,
    PRIMARY KEY (solicitud_id, jornada),
    CONSTRAINT fk_solicitud_jornada_solicitud
        FOREIGN KEY (solicitud_id) REFERENCES solicitud_trabajo (id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE solicitud_modalidad (
    solicitud_id INT(11) NOT NULL,
    modalidad ENUM('presencial', 'remoto', 'hibrido') NOT NULL,
    PRIMARY KEY (solicitud_id, modalidad),
    CONSTRAINT fk_solicitud_modalidad_solicitud
        FOREIGN KEY (solicitud_id) REFERENCES solicitud_trabajo (id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
