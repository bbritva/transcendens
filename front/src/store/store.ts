import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authorizationReducer from 'src/store/authorizationSlice';
import messageReducer from 'src/store/messageSlice';
import authReducer from 'src/store/authReducer';

//configureStore includes thunk middleware by default
export const store = configureStore({
  reducer: {
    authorization: authorizationReducer,
    message: messageReducer,
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// import { combineReducers } from "redux";
// import auth from "./auth";
// import message from "./messageSlice";

// export default combineReducers({
//   auth,
//   message,
// });