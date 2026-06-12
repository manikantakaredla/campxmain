import API from "../api/axios";

export const getStories = async () => {
  const { data } = await API.get('/success-stories');
  return data;
};

export const getStoryById = async (id) => {
  const { data } = await API.get(`/success-stories/${id}`);
  return data;
};

export const createStory = async (storyData) => {
  const { data } = await API.post('/success-stories', storyData);
  return data;
};

export const updateStory = async (id, storyData) => {
  const { data } = await API.put(`/success-stories/${id}`, storyData);
  return data;
};

export const deleteStory = async (id) => {
  const { data } = await API.delete(`/success-stories/${id}`);
  return data;
};
