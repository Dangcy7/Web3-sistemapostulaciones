-- Ejecutar manualmente despues de 001-004. Cambios aditivos e idempotentes.
DELIMITER $$
DROP PROCEDURE IF EXISTS cw_add_estado_publicacion_if_missing$$
CREATE PROCEDURE cw_add_estado_publicacion_if_missing()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'solicitud_trabajo' AND column_name = 'estado_publicacion') THEN
        ALTER TABLE solicitud_trabajo ADD COLUMN estado_publicacion ENUM('borrador','publicada','cerrada') NOT NULL DEFAULT 'borrador';
    END IF;
END$$
DELIMITER ;
CALL cw_add_estado_publicacion_if_missing();
DROP PROCEDURE cw_add_estado_publicacion_if_missing;

CREATE TABLE IF NOT EXISTS candidatura (
    id INT NOT NULL AUTO_INCREMENT,
    solicitud_id INT NOT NULL,
    postulante_id INT NOT NULL,
    estado ENUM('pendiente','en_revision','aceptada','rechazada') NOT NULL DEFAULT 'pendiente',
    postulada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_candidatura_solicitud_postulante (solicitud_id, postulante_id),
    KEY idx_candidatura_postulante (postulante_id),
    CONSTRAINT fk_candidatura_solicitud FOREIGN KEY (solicitud_id) REFERENCES solicitud_trabajo (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_candidatura_postulante FOREIGN KEY (postulante_id) REFERENCES postulante (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserta HTML solo cuando no exista ya en el catálogo (comparación sin distinción de mayúsculas).
INSERT INTO lenguaje (nombre)
SELECT 'HTML' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM lenguaje WHERE LOWER(nombre) = 'html');
