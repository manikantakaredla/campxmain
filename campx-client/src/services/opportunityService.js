import API from "../api/axios";

// ----------------------------------------
// Basic CRUD
// ----------------------------------------
export const getOpportunities = async (params = {}) => {
  const { data } = await API.get('/opportunities', { params });
  return data;
};

export const getOpportunityById = async (id) => {
  const { data } = await API.get(`/opportunities/${id}`);
  return data;
};

export const createOpportunity = async (opportunityData) => {
  const { data } = await API.post('/opportunities', opportunityData);
  return data;
};

export const updateOpportunity = async (id, opportunityData) => {
  const { data } = await API.put(`/opportunities/${id}`, opportunityData);
  return data;
};

export const deleteOpportunity = async (id) => {
  const { data } = await API.delete(`/opportunities/${id}`);
  return data;
};

export const restoreOpportunity = async (id) => {
  const { data } = await API.post(`/opportunities/${id}/restore`);
  return data;
};

// ----------------------------------------
// Student Actions (Apply / Save)
// ----------------------------------------
export const applyForOpportunity = async (id) => {
  const { data } = await API.post(`/opportunities/${id}/apply`);
  return data;
};

export const saveOpportunity = async (id) => {
  const { data } = await API.post(`/opportunities/${id}/save`);
  return data;
};

export const removeSavedOpportunity = async (id) => {
  const { data } = await API.delete(`/opportunities/${id}/save`);
  return data;
};

// ----------------------------------------
// Admin Actions (Applications / Analytics)
// ----------------------------------------
export const updateApplicationStatus = async (appId, status) => {
  const { data } = await API.patch(`/opportunities/applications/${appId}/status`, { status });
  return data;
};

export const getOpportunityAnalytics = async (id) => {
  const { data } = await API.get(`/opportunities/${id}/analytics`);
  return data;
};
