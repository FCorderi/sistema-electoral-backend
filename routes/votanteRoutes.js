const express = require("express")
const votanteController = require("../controllers/votanteController")

const router = express.Router()

router.post("/login", votanteController.login)
router.post("/votar", votanteController.votar)

module.exports = router