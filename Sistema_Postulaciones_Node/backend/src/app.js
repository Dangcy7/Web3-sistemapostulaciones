
const path = require("path");
require("./config/env");

const express = require("express");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const frontendPath = path.resolve(__dirname, "../../frontend");
const authRoutes = require("./routes/auth.routes");

const postulantesRoutes = require("./routes/postulantes.routes");
const solicitudesRoutes = require("./routes/solicitudes.routes");


app.use(express.json());
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
    res.json({
        mensaje: "API del Sistema de Postulaciones funcionando"
    });
});

app.use("/api/postulantes", postulantesRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
