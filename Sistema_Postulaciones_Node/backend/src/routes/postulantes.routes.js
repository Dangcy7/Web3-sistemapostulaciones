const { verificarToken, verificarAdmin } = require("../middlewares/auth.middleware");

const express = require("express");
const router = express.Router();

const {
    listarPostulantes,
    obtenerDetalle,
    crearPostulante,
    crearPerfilCompleto,
    actualizarPerfilCompleto,
    verificarNivelConocimiento,
    retirarVerificacionNivelConocimiento
} = require("../controllers/postulantes.controller");

router.get("/", verificarToken, verificarAdmin, listarPostulantes);

router.post("/", crearPostulante);
router.post("/completo", crearPerfilCompleto);

router.get("/:id", verificarToken, obtenerDetalle);
router.put("/:id", verificarToken, actualizarPerfilCompleto);
router.patch(
    "/:id/conocimientos/:tipo/:catalogoId/verificacion",
    verificarToken,
    verificarAdmin,
    verificarNivelConocimiento
);
router.delete(
    "/:id/conocimientos/:tipo/:catalogoId/verificacion",
    verificarToken,
    verificarAdmin,
    retirarVerificacionNivelConocimiento
);
module.exports = router;
