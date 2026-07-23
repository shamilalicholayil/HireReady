import axiosInstance from "./axiosInstance";

export const getConversationsList = () => axiosInstance.get("/messages");

export const getConversation = (userId, { before, limit = 30 } = {}) => {
  const params = { limit };
  if (before) params.before = before;
  return axiosInstance.get(`/messages/${userId}`, { params });
};

export const sendMessage = (receiverId, content, attachments = []) =>
  axiosInstance.post("/messages", { receiverId, content, attachments });

export const markAsRead = (userId) =>
  axiosInstance.patch(`/messages/${userId}/read`);

export const uploadAttachment = (file, receiverId, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("receiverId", receiverId);

  return axiosInstance.post("/messages/attachments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};
