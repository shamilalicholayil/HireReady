import axiosInstance from "./axiosInstance";

export const createQuestion = (data) =>
  axiosInstance.post("/admin/questions", data);

export const getAllQuestions = (params) =>
  axiosInstance.get("/admin/questions", { params });

export const getQuestionById = (id) =>
  axiosInstance.get(`/admin/questions/${id}`);

export const updateQuestion = (id, data) =>
  axiosInstance.put(`/admin/questions/${id}`, data);

export const toggleQuestionStatus = (id) =>
  axiosInstance.patch(`/admin/questions/${id}/toggle-status`);
