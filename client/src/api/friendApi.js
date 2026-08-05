import axiosInstance from "./axiosInstance";

export const searchUsers = (q, page = 1, limit = 10) =>
  axiosInstance.get(`/friend-requests/search`, { params: { q, page, limit } });

export const getIncomingRequests = () =>
  axiosInstance.get("/friend-requests/incoming", { params: { limit: 50 } });

export const getOutgoingRequests = () =>
  axiosInstance.get("/friend-requests/outgoing", { params: { limit: 50 } });

export const getFriends = (page = 1, limit = 10) =>
  axiosInstance.get("/friend-requests/friends", { params: { page, limit } });

export const sendFriendRequest = (receiverId) =>
  axiosInstance.post("/friend-requests", { receiverId });

export const acceptRequest = (requestId) =>
  axiosInstance.patch(`/friend-requests/${requestId}/accept`);

export const rejectRequest = (requestId) =>
  axiosInstance.patch(`/friend-requests/${requestId}/reject`);

export const cancelRequest = (requestId) =>
  axiosInstance.patch(`/friend-requests/${requestId}/cancel`);

export const blockUser = (userId) =>
  axiosInstance.post(`/friend-requests/block/${userId}`);

export const unblockUser = (userId) =>
  axiosInstance.delete(`/friend-requests/block/${userId}`);
