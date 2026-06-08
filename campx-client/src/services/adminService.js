import API from "../api/axios";

export const getFacultyRequests = () =>
  API.get("/admin/faculty-requests");

export const approveFaculty = (id) =>
  API.put(`/admin/approve/${id}`);

export const rejectFaculty = (id) =>
  API.put(`/admin/reject/${id}`);
export const getAllUsers = () =>
  API.get("/admin/users");

export const deleteUser = (id) =>
  API.delete(`/admin/users/${id}`);
export const getUserById = (id) =>
  API.get(`/admin/users/${id}`);