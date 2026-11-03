const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
    const autorizacion = req.headers.authorization;

    if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión"
        });
    }

    const token = autorizacion.split(" ")[1];

    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = datos;
        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: "Token inválido o expirado"
        });
    }
}

function verificarAdmin(req, res, next) {
    if (req.usuario.rol !== "admin") {
        return res.status(403).json({
            mensaje: "No tienes permisos de administrador"
        });
    }

    next();
}

module.exports = {
    verificarToken,
    verificarAdmin
};