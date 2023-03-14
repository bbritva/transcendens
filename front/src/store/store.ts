import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import messageReducer from 'src/store/messageSlice';
import authReducer from 'src/store/authReducer';
import userReducer from 'src/store/userSlice'
import chatReducer from 'src/store/chatSlice'
import gamesReducer from 'src/store/gamesSlice'


//configureStore includes thunk middleware by default
export const store = configureStore({
  reducer: {
    message: messageReducer,
    auth: authReducer,
    user: userReducer,
    chat: chatReducer,
    games: gamesReducer
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
