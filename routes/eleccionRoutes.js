const express = require("express")
const eleccionController = require("../controllers/eleccionController")

const router = express.Router()

router.get("/activa", eleccionController.obtenerEleccionActiva)
router.get("/:idEleccion/papeletas", eleccionController.obtenerPapeletas)
router.get("/resultados/nacionales", eleccionController.obtenerResultadosNacionales)
router.get("/resultados/:idCircuito", eleccionController.obtenerResultados)
router.get("/resultados/departamento/:idDepartamento", eleccionController.obtenerResultadosDepartamento)


module.exports = router