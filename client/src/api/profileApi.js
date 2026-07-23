import axiosInstance from "./axiosInstance";

export const getProfile = () => axiosInstance.get("/profile/me");

export const updateProfile = (data) => axiosInstance.put("/profile/me", data);

export const uploadAvatar = (formData) =>
  axiosInstance.put("/profile/me/avatar", formData);

export const uploadResume = (formData) =>
  axiosInstance.post("/profile/me/resume", formData);

export const uploadHRDocument = (formData) =>
  axiosInstance.post("/profile/me/hr-document", formData);

export const reapplyHR = () => axiosInstance.patch("/profile/me/reapply-hr");
