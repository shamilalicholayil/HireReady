import axiosInstance from "./axiosInstance";

export const startInterviewSession = (data) =>
  axiosInstance.post("/interview/sessions", data);

export const submitInterviewAnswer = (data) =>
  axiosInstance.post("/interview/sessions/answer", data);

export const finishInterviewSession = (sessionId) =>
  axiosInstance.patch(`/interview/sessions/${sessionId}/finish`);

export const getInterviewQuestionById = (id) =>
  axiosInstance.get(`/interview/questions/${id}`);
