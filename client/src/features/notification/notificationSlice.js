import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi } from "../../api/notificationApi";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (params) => {
    const res = await notificationApi.getMyNotifications(params);
    return res.data.data;
  },
);

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (id) => {
    const res = await notificationApi.markAsRead(id);
    return res.data.data.notification;
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  async () => {
    await notificationApi.markAllAsRead();
  },
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    notificationReceived: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.items.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1 && !state.items[idx].isRead) {
          state.items[idx].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { notificationReceived } = notificationSlice.actions;
export default notificationSlice.reducer;
