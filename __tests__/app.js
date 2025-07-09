const express = require("express");
const cors = require("cors");
require("dotenv").config();

const votanteRoutes = require("../routes/votanteRoutes");
const eleccionRoutes = require("../routes/eleccionRoutes");
const mesaRoutes = require("../routes/mesaRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/votantes", votanteRoutes);
app.use("/api/elecciones", eleccionRoutes);
app.use("/api/mesas", mesaRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Sistema Electoral API funcionando" });
});

module.exports = app;
