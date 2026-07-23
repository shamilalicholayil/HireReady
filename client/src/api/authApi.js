import axiosInstance from "./axiosInstance";

export const initiateRegister = (data) =>
  axiosInstance.post("/auth/register", data);

export const verifyOtp = (data) =>
  axiosInstance.post("/auth/register/verify", data);

export const initiateRegisterHR = (data) =>
  axiosInstance.post("/auth/register-hr", data);

export const verifyOtpHR = (data) =>
  axiosInstance.post("/auth/register-hr/verify", data);

export const loginUser = (data) => axiosInstance.post("/auth/login", data);

export const logoutUser = () => axiosInstance.post("/auth/logout");

export const refreshToken = () => axiosInstance.post("/auth/refresh");

export const forgotPasswordApi = (email) =>
  axiosInstance.post("/auth/forgot-password", { email });

export const resetPasswordApi = (token, newPassword) =>
  axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
