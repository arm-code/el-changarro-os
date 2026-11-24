import axios from 'axios';

export const ACTIVE_BUSINESS_KEY = 'active_business_id';

export function getActiveBusinessId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_BUSINESS_KEY);
}

export function setActiveBusinessIdInStorage(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_BUSINESS_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_BUSINESS_KEY);
  }
}

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // La sesión es una cookie httpOnly que pone el API
  withCredentials: true,
});

// Interceptor para agregar X-Business-ID
axiosInstance.interceptors.request.use(
  async (config) => {
    const activeBusinessId = getActiveBusinessId();
    if (activeBusinessId) {
      config.headers['X-Business-ID'] = activeBusinessId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para desempaquetar la respuesta de la API de ARM Solutions
axiosInstance.interceptors.response.use(
  (response) => {
    // La API responde con { success: true, message: "...", data: { ... } }
    if (response.data && typeof response.data.success !== 'undefined') {
      // Si la respuesta indica éxito, devolvemos el payload real en "data"
      if (response.data.success) {
        response.data = response.data.data;
      } else {
        // En caso de que success sea false pero status 200 (poco común, pero por si acaso)
        return Promise.reject(new Error(response.data.message || 'Error en la petición'));
      }
    }
    return response;
  },
  (error) => {
    // Manejo de errores estándar de la API
    if (error.response && error.response.data) {
      const apiError = error.response.data;
      
      // Construir mensaje de error
      let errorMessage = apiError.message || 'Ocurrió un error inesperado.';
      
      if (apiError.error && Array.isArray(apiError.error)) {
        errorMessage += ' Detalles: ' + apiError.error.join(', ');
      }
      
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.reject(error);
  }
);
