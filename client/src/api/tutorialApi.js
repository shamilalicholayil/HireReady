import axiosInstance from "./axiosInstance";

// Admin
export const createTutorial = (data) =>
  axiosInstance.post("/admin/tutorials", data);

export const getAllTutorials = (params) =>
  axiosInstance.get("/admin/tutorials", { params });

export const getTutorialById = (id) =>
  axiosInstance.get(`/admin/tutorials/${id}`);

export const updateTutorial = (id, data) =>
  axiosInstance.put(`/admin/tutorials/${id}`, data);

export const toggleTutorialStatus = (id) =>
  axiosInstance.patch(`/admin/tutorials/${id}/toggle-status`);

// Public
export const getPublicTutorials = (params) =>
  axiosInstance.get("/tutorials", { params });

export const getPublicTutorialById = (id) =>
  axiosInstance.get(`/tutorials/${id}`);
