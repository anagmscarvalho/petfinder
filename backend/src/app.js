require('dotenv').config()
const express = require('express')
const cors = require('cors')
const petRoutes = require('./routes/pets')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Rotas
app.use('/api/pets', petRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'petfinder-backend' })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})
