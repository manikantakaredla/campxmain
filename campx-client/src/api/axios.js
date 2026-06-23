import axios from "axios";

const API = axios.create({
  baseURL: "https://campxserver.onrender.com/api"
});

API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  }
);

// --- Client-Side SWR Caching for "Powerful Speed" ---
const cache = new Map();
const getCacheKey = (url, params) => url + JSON.stringify(params || {});
export const clearCache = () => cache.clear();

const originalGet = API.get;
API.get = async (url, config = {}) => {
  const cacheKey = getCacheKey(url, config.params);
  
  if (cache.has(cacheKey) && !config.skipCache) {
    const cachedResponse = cache.get(cacheKey);
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
const originalPost = API.post;
API.post = async (url, data, config) => { clearCache(); return originalPost(url, data, config); };

const originalPut = API.put;
API.put = async (url, data, config) => { clearCache(); return originalPut(url, data, config); };

const originalPatch = API.patch;
API.patch = async (url, data, config) => { clearCache(); return originalPatch(url, data, config); };

const originalDelete = API.delete;
API.delete = async (url, config) => { clearCache(); return originalDelete(url, config); };

export default API;