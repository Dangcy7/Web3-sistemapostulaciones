
const pool = require("./config/database");

async function probarConexion() {
    try {
        const conexion = await pool.getConnection();

        console.log("Conexión a MySQL exitosa.");

        const [filas] = await conexion.query(
            "SELECT DATABASE() AS base_actual"
        );

        console.log("Base de datos:", filas[0].base_actual);

        conexion.release();
    } catch (error) {
        console.error("Error de conexión:", error.message);
    } finally {
        await pool.end();
    }
}

probarConexion();
