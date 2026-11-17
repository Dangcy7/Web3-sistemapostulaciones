const express = require("express");
const { listarCatalogosBusqueda } = require("../controllers/postulantes.controller");

const router = express.Router();
// Solo expone nombres e IDs de catálogos, usados también durante el registro público.
router.get("/conocimientos", listarCatalogosBusqueda);

module.exports = router;
