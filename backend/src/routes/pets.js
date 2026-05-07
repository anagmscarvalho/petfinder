const express = require('express')
const multer = require('multer')
const petController = require('../controllers/petController')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Cadastrar pet perdido
router.post('/lost', upload.array('photos', 5), petController.registerLost)

// Listar pets perdidos
router.get('/lost', petController.listLost)

// Comparar foto de animal encontrado com cadastrados
router.post('/compare', upload.single('photo'), petController.compare)

module.exports = router
