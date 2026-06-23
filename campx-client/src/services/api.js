import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'https://campxserver.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
  const token =
  localStorage.getItem('token') ||
  sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
   if (error.response?.status === 401) {
  // localStorage.removeItem('token')
  // localStorage.removeItem('user')
  // window.location.href = '/'
  // toast.error('Session expired. Please login again.')
}
    return Promise.reject(error)
  }
)

// --- Client-Side SWR Caching for "Powerful Speed" ---
const cache = new Map();
const getCacheKey = (url, params) => url + JSON.stringify(params || {});
export const clearCache = () => cache.clear();

const originalGet = api.get;
api.get = async (url, config = {}) => {
  const cacheKey = getCacheKey(url, config.params);
  
  // Return cached response instantly if available
  if (cache.has(cacheKey) && !config.skipCache) {
    const cachedResponse = cache.get(cacheKey);
    // Fetch in background to keep cache fresh (SWR pattern)
    originalGet(url, config).then(res => {
      cache.set(cacheKey, res);
    }).catch(() => {});
    
    return Promise.resolve(cachedResponse);
  }

  const response = await originalGet(url, config);
  if (response.status >= 200 && response.status < 300) {
    cache.set(cacheKey, response);
  }
  return response;
};

// Clear cache on any mutation
const originalPost = api.post;
api.post = async (url, data, config) => { clearCache(); return originalPost(url, data, config); };

const originalPut = api.put;
api.put = async (url, data, config) => { clearCache(); return originalPut(url, data, config); };

const originalPatch = api.patch;
api.patch = async (url, data, config) => { clearCache(); return originalPatch(url, data, config); };

const originalDelete = api.delete;
api.delete = async (url, config) => { clearCache(); return originalDelete(url, config); };

export default api