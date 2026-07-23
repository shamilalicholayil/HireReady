import axiosInstance from "./axiosInstance";

export const saveAnswer = (data) => axiosInstance.post("/answers", data);

export const getAnswerHistory = (params) =>
  axiosInstance.get("/answers", { params });
