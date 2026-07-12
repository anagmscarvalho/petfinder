/**
 * Configuração base para chamadas HTTP ao backend.
 *
 * O backend roda via Docker (docker-compose) na porta 3001.
 * Ao testar no emulador Android, use http://10.0.2.2:3001
 * Ao testar no Expo Go (celular físico), use o IP da sua máquina na rede local.
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Wrapper para fetch com configurações padrão.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  /**
   * Upload de imagem usando FormData (para envio de fotos de pets).
   */
  uploadImage: async (endpoint, imageUri, fieldName = 'image', extraFields = {}) => {
    const formData = new FormData();

    formData.append(fieldName, {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    Object.entries(extraFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload Error (${response.status}): ${error}`);
    }

    return response.json();
  },
};

export default api;
