import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import sessionReducer from "../features/session/sessionSlice";
import messagesReducer from "../features/messages/messagesSlice";
import friendReducer from "../features/friend/friendSlice";
import themeReducer from "../features/theme/themeSlice";
import slotReducer from "../features/slot/slotSlice";
import interviewReducer from "../features/interview/interviewSlice";
import leaderboardReducer from "../features/leaderboard/leaderboardSlice";

const appReducer = combineReducers({
  auth: authReducer,
  session: sessionReducer,
  messages: messagesReducer,
  friends: friendReducer,
  theme: themeReducer,
  slot: slotReducer,
  interview: interviewReducer,
  leaderboard: leaderboardReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "auth/logout") {
    const { theme } = state;
    state = { theme };
  }
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });
export default store;
