const supabase = require('../config/supabase')

// POST /api/pets/lost
exports.registerLost = async (req, res) => {
  try {
    // TODO: salvar dados do pet no Supabase
    // TODO: fazer upload das fotos para o Supabase Storage
    // TODO: chamar serviço de IA para gerar embedding
    res.status(201).json({ message: 'Pet cadastrado com sucesso' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao cadastrar pet' })
  }
}

// GET /api/pets/lost
exports.listLost = async (req, res) => {
  try {
    // TODO: buscar pets perdidos do Supabase com filtros
    res.json({ pets: [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao listar pets' })
  }
}

// POST /api/pets/compare
exports.compare = async (req, res) => {
  try {
    // TODO: enviar imagem para o serviço de IA
    // TODO: retornar lista de matches com % de similaridade
    res.json({ matches: [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao comparar' })
  }
}
