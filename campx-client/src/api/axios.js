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

export default API;