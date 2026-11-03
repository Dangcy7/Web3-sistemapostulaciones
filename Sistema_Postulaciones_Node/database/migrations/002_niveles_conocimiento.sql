-- Migración aditiva: conserva las asociaciones actuales y deja los niveles
-- históricos como pendientes (NULL). No asigna niveles por inferencia.

ALTER TABLE postulante_lenguaje
    ADD COLUMN nivel_declarado ENUM('basico', 'intermedio', 'avanzado', 'experto') NULL DEFAULT NULL,
    ADD COLUMN nivel_verificado ENUM('basico', 'intermedio', 'avanzado', 'experto') NULL DEFAULT NULL,
    ADD COLUMN verificado_por_usuario_id INT(11) NULL DEFAULT NULL,
    ADD COLUMN verificado_en DATETIME NULL DEFAULT NULL,
    ADD KEY idx_pl_nivel_verificador (verificado_por_usuario_id),
    ADD CONSTRAINT fk_pl_nivel_verificador
        FOREIGN KEY (verificado_por_usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE postulante_herramienta
    ADD COLUMN nivel_declarado ENUM('basico', 'intermedio', 'avanzado', 'experto') NULL DEFAULT NULL,
    ADD COLUMN nivel_verificado ENUM('basico', 'intermedio', 'avanzado', 'experto') NULL DEFAULT NULL,
    ADD COLUMN verificado_por_usuario_id INT(11) NULL DEFAULT NULL,
    ADD COLUMN verificado_en DATETIME NULL DEFAULT NULL,
    ADD KEY idx_ph_nivel_verificador (verificado_por_usuario_id),
    ADD CONSTRAINT fk_ph_nivel_verificador
        FOREIGN KEY (verificado_por_usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT;

-- Los requisitos antiguos quedan sin mínimo y mantienen la comparación por
-- presencia que usaba el módulo antes de esta migración.
ALTER TABLE solicitud_lenguaje
    ADD COLUMN nivel_minimo ENUM('basico', 'intermedio', 'avanzado', 'experto') NULL DEFAULT NULL;

ALTER TABLE solicitud_herramienta
    ADD COLUMN nivel_minimo ENUM('basico', 'intermedio', 'avanzado', 'experto') NULL DEFAULT NULL;
