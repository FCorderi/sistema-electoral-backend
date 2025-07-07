const express = require("express")
const eleccionController = require("../controllers/eleccionController")

const router = express.Router()

// Las rutas específicas deben ir antes que las rutas con parámetros
router.get("/activa", eleccionController.obtenerEleccionActiva)
router.get("/resultados/nacionales", eleccionController.obtenerResultadosNacionales)
router.get("/resultados/departamento/:idDepartamento", eleccionController.obtenerResultadosDepartamento)
router.get("/resultados/:idCircuito", eleccionController.obtenerResultados)
router.get("/:idEleccion/papeletas", eleccionController.obtenerPapeletas)

module.exports = router