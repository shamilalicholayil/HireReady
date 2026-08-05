import axiosInstance from "./axiosInstance";

export const fetchMySlots = (params = {}) =>
  axiosInstance.get("/slots/my-interviews", { params });

export const fetchSlotById = (id) => axiosInstance.get(`/slots/${id}`);

export const updateInterviewStatus = (slotId, status) =>
  axiosInstance.patch(`/slots/${slotId}/interview-status`, { status });

export const createSlot = (slotData) => axiosInstance.post("/slots", slotData);
