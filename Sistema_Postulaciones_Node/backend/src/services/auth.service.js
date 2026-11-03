const db = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function iniciarSesion(usuario, contraseña) {

    // Buscar la cuenta por su nombre de usuario
    const [resultados] = await db.execute(
        "SELECT * FROM usuario WHERE usuario = ?",
        [usuario]
    );

    if (resultados.length === 0) {
        return null;
    }

    const cuenta = resultados[0];

    // Comprobar la contraseña
    const contraseñaCorrecta = await bcrypt.compare(
        contraseña,
        cuenta.contrasena
    );

    if (!contraseñaCorrecta) {
        return null;
    }

    // Crear el token de acceso
    const token = jwt.sign(
        {
            id: cuenta.id,
            usuario: cuenta.usuario,
            rol: cuenta.rol,
            postulante_id: cuenta.postulante_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );

    return {
        token,
        usuario: cuenta.usuario,
        rol: cuenta.rol
    };
}

module.exports = {
    iniciarSesion
};