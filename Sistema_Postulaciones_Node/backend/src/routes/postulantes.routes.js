const { verificarToken, verificarAdmin } = require("../middlewares/auth.middleware");

const express = require("express");
const router = express.Router();

const {
    listarPostulantes,
    obtenerDetalle,
    crearPostulante,
    crearPerfilCompleto,
    actualizarPerfilCompleto
} = require("../controllers/postulantes.controller");

router.get("/", verificarToken, verificarAdmin, listarPostulantes);

router.post("/", crearPostulante);
router.post("/completo", crearPerfilCompleto);

router.get("/:id", verificarToken, obtenerDetalle);
router.put("/:id", verificarToken, actualizarPerfilCompleto);
module.exports = router;