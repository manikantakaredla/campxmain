import API from "../api/axios";

export const getExperiences = async (params = {}) => {
  const { data } = await API.get('/interviews', { params });
  return data;
};

export const getExperienceById = async (id) => {
  const { data } = await API.get(`/interviews/${id}`);
  return data;
};

export const submitExperience = async (experienceData) => {
  const { data } = await API.post('/interviews', experienceData);
  return data;
};

// Admin
export const approveExperience = async (id, status) => {
  const { data } = await API.put(`/interviews/${id}/approve`, { status });
  return data;
};

export const deleteExperience = async (id) => {
  const { data } = await API.delete(`/interviews/${id}`);
  return data;
};
