const express = require("express")
const mesaController = require("../controllers/mesaController")

const router = express.Router()

router.get("/:idCircuito/estado", mesaController.obtenerEstadoMesa)
router.post("/:idCircuito/cerrar", mesaController.cerrarMesa)
router.get("/abiertas", mesaController.obtenerMesasAbiertas)

module.exports = router