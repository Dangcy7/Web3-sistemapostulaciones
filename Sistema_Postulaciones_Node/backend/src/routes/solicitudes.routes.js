const express = require("express");
const { verificarToken, verificarAdmin } = require("../middlewares/auth.middleware");
const controller = require("../controllers/solicitudes.controller");

const router = express.Router();
router.get("/publicadas", controller.publicadas);
router.get("/mis-candidaturas", verificarToken, (req, res, next) => req.usuario.rol === "postulante" ? next() : res.status(403).json({ ok: false, mensaje: "Solo los postulantes pueden consultar sus candidaturas." }), controller.mias);
router.post("/:id/postular", verificarToken, (req, res, next) => req.usuario.rol === "postulante" ? next() : res.status(403).json({ ok: false, mensaje: "Solo los postulantes pueden enviar candidaturas." }), controller.postular);
router.use(verificarToken, verificarAdmin);
router.get("/", controller.listar);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.patch("/:id/estado", controller.estado);
router.get("/:id/candidaturas", controller.candidaturas);
router.patch("/candidaturas/:id/estado", controller.estadoCandidatura);
router.get("/:id/coincidencias", controller.coincidencias);

module.exports = router;
