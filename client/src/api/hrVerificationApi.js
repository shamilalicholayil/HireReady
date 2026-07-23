import axiosInstance from "./axiosInstance";

export const getHRApplicants = (params) =>
  axiosInstance.get("/admin/hr-applicants", { params });

export const approveHRApplicant = (id) =>
  axiosInstance.patch(`/admin/hr-applicants/${id}/approve`);

export const rejectHRApplicant = (id, reason) =>
  axiosInstance.patch(`/admin/hr-applicants/${id}/reject`, { reason });
