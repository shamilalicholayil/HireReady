import axiosInstance from "./axiosInstance";

export const getAllUsers = (params) =>
  axiosInstance.get("/admin/users", { params });

export const toggleBlockUser = (id) =>
  axiosInstance.patch(`/admin/users/${id}/toggle-block`);
