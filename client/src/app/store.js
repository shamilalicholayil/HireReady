import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import sessionReducer from "../features/session/sessionSlice";
import messagesReducer from "../features/messages/messagesSlice";
import friendReducer from "../features/friend/friendSlice";
import themeReducer from "../features/theme/themeSlice";
import slotReducer from "../features/slot/slotSlice";
import interviewReducer from "../features/interview/interviewSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    messages: messagesReducer,
    friends: friendReducer,
    theme: themeReducer,
    slot: slotReducer,
    interview: interviewReducer,
  },
});

export default store;
