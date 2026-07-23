import axios from "axios";
import { store } from "../app/store";
import { setCredentials, logout } from "../features/auth/authSlice";

const BASE_URL = "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  Interceptor Boilerplate
axiosInstance.interceptors.response.use(
  (response) => response, // success — just pass it through
  async (error) => {
    const originalRequest = error.config;

    // if 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // call refresh endpoint — browser sends HTTP-only cookie automatically
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const { accessToken, user } = res.data;

        // update Redux store with new token
        store.dispatch(setCredentials({ user, accessToken }));

        // retry the original failed request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // refresh token expired — log user out
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
