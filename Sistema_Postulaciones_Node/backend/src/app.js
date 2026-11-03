
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");

const app = express();
const PORT = 3000;
const authRoutes = require("./routes/auth.routes");

const postulantesRoutes = require("./routes/postulantes.routes");


app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "API del Sistema de Postulaciones funcionando"
    });
});

app.use("/api/postulantes", postulantesRoutes);
app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
