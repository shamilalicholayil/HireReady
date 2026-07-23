import axiosInstance from "./axiosInstance";

export const fetchMySlots = () => axiosInstance.get("/slots/my-interviews");

export const fetchSlotById = (id) => axiosInstance.get(`/slots/${id}`);

export const updateInterviewStatus = (slotId, status) =>
  axiosInstance.patch(`/slots/${slotId}/interview-status`, { status });
