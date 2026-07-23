/**
 * Camada de comunicação com o backend FastAPI.
 *
 * O backend FastAPI roda na porta 8000.
 * No emulador Android, use http://10.0.2.2:8000
 * Em dispositivo físico (Expo Go), use o IP da máquina na rede local.
 */

import { Platform } from 'react-native';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web' ? 'http://localhost:8000' : 'http://10.0.2.2:8000');

// ── Helpers ──────────────────────────────────────────────────

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `Erro ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) {
        // FastAPI errors usually come in 'detail'
        errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch (e) {
      // Fallback if not JSON
      const text = await response.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }
  // 204 No Content
  if (response.status === 204) return null;
  
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  const response = await fetch(url, config);
  return handleResponse(response);
}

// ── Auth ─────────────────────────────────────────────────────

/**
 * Login — o FastAPI usa OAuth2PasswordRequestForm, que espera form-data
 * com os campos `username` e `password` (não JSON).
 */
export async function login(email, senha) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', senha);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  return handleResponse(response);
}

export async function register(dados) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function loginWithGoogle(idToken) {
  return request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function loginWithApple(idToken) {
  return request('/auth/apple', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
}

// ── Perfil ───────────────────────────────────────────────────

export async function getProfile(token) {
  return request('/users/me', {
    headers: authHeaders(token),
  });
}

export async function updateProfile(token, dados) {
  return request('/users/me', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(dados),
  });
}

export async function deleteAccount(token) {
  return request('/users/me', {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ── Pets ─────────────────────────────────────────────────────

export async function listPets(filtros = {}) {
  const params = new URLSearchParams();
  // O backend (routers/feed.py) usa 'status_filtro' no GET /feed
  if (filtros.status) params.append('status_filtro', filtros.status);
  
  // O backend aceita 'bairros'
  if (filtros.bairro) {
    params.append('bairros', filtros.bairro);
  }
  
  const qs = params.toString();
  
  const feed = await request(`/feed${qs ? `?${qs}` : ''}`);
  
  // O endpoint /feed retorna [{ tipo: 'pet', pet: {...} }, { tipo: 'anuncio', anuncio: {...} }]
  if (Array.isArray(feed)) {
    return feed
      .filter(item => item.tipo === 'pet')
      .map(item => item.pet);
  }
  return [];
}

export async function getPet(petId) {
  return request(`/pets/${petId}`);
}

export async function createPet(token, dados) {
  return request('/pets', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(dados),
  });
}

export async function updatePetStatus(token, petId, novoStatus) {
  return request(`/pets/${petId}/status`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ status: novoStatus }),
  });
}

/**
 * Upload de foto de pet usando FormData (para envio via Expo).
 */
export async function uploadPhoto(token, petId, imageUri) {
  const formData = new FormData();
  
  if (Platform.OS === 'web') {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    formData.append('arquivo', blob, 'photo.jpg');
  } else {
    formData.append('arquivo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
  }

  const response = await fetch(`${API_BASE_URL}/pets/${petId}/fotos`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      // Não definir Content-Type — o fetch define automaticamente com boundary
    },
    body: formData,
  });
  return handleResponse(response);
}

// ── Meus Pets ────────────────────────────────────────────────

export async function getMyPets(token) {
  return request('/users/me/pets', {
    headers: authHeaders(token),
  });
}

// ── Favoritos ────────────────────────────────────────────────

export async function getFavorites(token) {
  return request('/users/me/favorites', {
    headers: authHeaders(token),
  });
}

export async function addFavorite(token, petId) {
  return request(`/users/me/favorites/${petId}`, {
    method: 'POST',
    headers: authHeaders(token),
  });
}

export async function removeFavorite(token, petId) {
  return request(`/users/me/favorites/${petId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

export async function deletePet(token, petId) {
  return request(`/pets/${petId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ── Chat ──────────────────────────────────────────────────────────

export async function getConversations(token) {
  return request('/chat', {
    headers: authHeaders(token),
  });
}

export async function startConversation(token, petId) {
  return request(`/chat/pet/${petId}/iniciar`, {
    method: 'POST',
    headers: authHeaders(token),
  });
}

export async function getMessages(token, conversaId) {
  return request(`/chat/${conversaId}/mensagens`, {
    headers: authHeaders(token),
  });
}

export async function sendMessage(token, conversaId, texto) {
  return request(`/chat/${conversaId}/mensagens`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ texto }),
  });
}

// ── Export agrupado (retrocompatibilidade) ────────────────────

// ── Notifications ──────────────────────────────────────────────

export async function getNotifications(token) {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: authHeaders(token),
  });
  return handleResponse(response);
}

export async function markNotificationAsRead(token, notificacaoId) {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificacaoId}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  return handleResponse(response);
}

const api = {
  login,
  register,
  loginWithGoogle,
  loginWithApple,
  getProfile,
  updateProfile,
  deleteAccount,
  listPets,
  getPet,
  createPet,
  updatePetStatus,
  uploadPhoto,
  deletePet,
  getMyPets,
  getFavorites,
  addFavorite,
  removeFavorite,
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  getNotifications,
  markNotificationAsRead,
};

export default api;

export const deleteConversation = async (token, conversaId) => {
  const res = await api.delete(`/chat/${conversaId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export async function searchByPhoto(token, imageUri) {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const res = await fetch(imageUri);
    const blob = await res.blob();
    formData.append('arquivo', blob, 'search.jpg');
  } else {
    formData.append('arquivo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'search.jpg',
    });
  }

  const response = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
    },
    body: formData,
  });
  return handleResponse(response);
}
