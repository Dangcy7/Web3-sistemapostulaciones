const authService = require("../services/auth.service");

async function login(req, res) {
    try {
        const { usuario, contraseña } = req.body;

        if (!usuario || !contraseña) {
            return res.status(400).json({
                mensaje: "Debes ingresar usuario y contraseña"
            });
        }

        const resultado = await authService.iniciarSesion(
            usuario,
            contraseña
        );

        if (!resultado) {
            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos"
            });
        }

        res.json({
            mensaje: "Inicio de sesión exitoso",
            ...resultado
        });

    } catch (error) {
        console.error("Error en login:", error);

        res.status(500).json({
            mensaje: "Error interno del servidor"
        });
    }
}

module.exports = {
    login
};