import API from "../api/axios";

export const getPlacements = async (params = {}) => {
  const { data } = await API.get('/placements', { params });
  return data;
};

export const getPlacementStatistics = async () => {
  const { data } = await API.get('/placements/statistics');
  return data;
};

export const getSalaryTrends = async () => {
  const { data } = await API.get('/placements/statistics/trends');
  return data;
};

export const downloadTemplate = async () => {
  const response = await API.get('/placements/template', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'placement_upload_template.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const uploadPlacements = async (formData) => {
  const { data } = await API.post('/placements/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};
