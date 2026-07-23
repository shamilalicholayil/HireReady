import axiosInstance from "./axiosInstance";

export const fetchActiveJobs = () => axiosInstance.get("/jobs");

export const fetchMyJobPostings = (includeClosed = false) =>
  axiosInstance.get("/jobs/my-postings", { params: { includeClosed } });

export const createJob = (jobData) => axiosInstance.post("/jobs", jobData);

export const toggleJobStatus = (jobId) =>
  axiosInstance.patch(`/jobs/${jobId}/toggle-status`);

export const applyToJob = (jobId) => axiosInstance.post(`/jobs/${jobId}/apply`);

export const fetchJobApplications = (jobId) =>
  axiosInstance.get(`/jobs/${jobId}/applications`);

export const updateApplicationStatus = (appId, status) =>
  axiosInstance.patch(`/jobs/applications/${appId}/status`, { status });

export const closeJobAndSchedule = (jobId, payload) =>
  axiosInstance.post(`/jobs/${jobId}/close-and-schedule`, payload);
