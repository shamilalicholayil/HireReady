import axiosInstance from "./axiosInstance";

export const fetchMyInterviewJobGroups = (params = {}) =>
  axiosInstance.get("/slots/my-interviews/jobs", { params });

export const fetchMySlots = (params = {}) =>
  axiosInstance.get("/slots/my-interviews", { params });

export const fetchSlotById = (id) => axiosInstance.get(`/slots/${id}`);

export const updateInterviewStatus = (slotId, status) =>
  axiosInstance.patch(`/slots/${slotId}/interview-status`, { status });

export const setSlotOutcome = (slotId, outcome) =>
  axiosInstance.patch(`/slots/${slotId}/outcome`, { outcome });

export const scheduleNextRound = (slotId, startTime, endTime) =>
  axiosInstance.post(`/slots/${slotId}/next-round`, { startTime, endTime });
