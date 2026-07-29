import axiosInstance from "./axiosInstance";

export const fetchLeaderboard = ({ track, difficulty, page = 1, limit = 20 }) =>
  axiosInstance.get("/leaderboard", {
    params: { track, difficulty, page, limit },
  });

export const fetchMyRank = ({ track, difficulty }) =>
  axiosInstance.get("/leaderboard/my-rank", { params: { track, difficulty } });
