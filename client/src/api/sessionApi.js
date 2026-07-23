import axiosInstance from "./axiosInstance";

export const createSession = (data) => axiosInstance.post("/sessions", data);

export const getMySessions = () => axiosInstance.get("/sessions/me");

export const getSessionById = (id) => axiosInstance.get(`/sessions/${id}`);
