import axiosInstance from "./axiosInstance";

export const fetchActiveJobs = (params = {}) =>
  axiosInstance.get("/jobs", { params });

export const fetchJobById = (jobId) => axiosInstance.get(`/jobs/${jobId}`);

export const fetchMyJobPostings = (params = {}) =>
  axiosInstance.get("/jobs/my-postings", { params });

export const createJob = (jobData) => axiosInstance.post("/jobs", jobData);

export const toggleJobStatus = (jobId) =>
  axiosInstance.patch(`/jobs/${jobId}/toggle-status`);

export const applyToJob = (jobId) => axiosInstance.post(`/jobs/${jobId}/apply`);

export const fetchJobApplications = (jobId, params = {}) =>
  axiosInstance.get(`/jobs/${jobId}/applications`, { params });

export const updateApplicationStatus = (appId, status) =>
  axiosInstance.patch(`/jobs/applications/${appId}/status`, { status });

export const closeJob = (jobId) => axiosInstance.patch(`/jobs/${jobId}/close`);

export const scheduleApplicantInterview = (appId, startTime, endTime) =>
  axiosInstance.post(`/jobs/applications/${appId}/schedule`, {
    startTime,
    endTime,
  });
