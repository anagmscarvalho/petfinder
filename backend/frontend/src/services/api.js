const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function registerLostPet(formData) {
  const response = await fetch(`${API_URL}/api/pets/lost`, {
    method: 'POST',
    body: formData,
  })
  return response.json()
}

export async function searchFoundPet(formData) {
  const response = await fetch(`${API_URL}/api/pets/compare`, {
    method: 'POST',
    body: formData,
  })
  return response.json()
}

export async function listLostPets(filters = {}) {
  const params = new URLSearchParams(filters)
  const response = await fetch(`${API_URL}/api/pets/lost?${params}`)
  return response.json()
}
