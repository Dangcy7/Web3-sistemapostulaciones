const express = require("express");
const { verificarToken, verificarAdmin } = require("../middlewares/auth.middleware");
const controller = require("../controllers/solicitudes.controller");

const router = express.Router();
router.use(verificarToken, verificarAdmin);
router.get("/", controller.listar);
router.post("/", controller.crear);
router.get("/:id/coincidencias", controller.coincidencias);

module.exports = router;
