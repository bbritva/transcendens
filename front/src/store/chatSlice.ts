import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'src/store/store';
import { newMessageI, userFromBackI } from 'src/pages/Chat/ChatPage';

export interface chatState {
  users: [{
    user: userFromBackI,
    messages: newMessageI[]
  }],
}

const initialState = {} as chatState;

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<chatState>) {
      state.users = action.payload.users;
    },
    setUserMessages(
      state, 
      action: PayloadAction<{user: userFromBackI, messages: newMessageI[]}>
    ) {
      const ind = state.users.findIndex(
        (el) => el.user.username == action.payload.user.username
      );
      state.users[ind].messages = action.payload.messages;
    }
  }

})

export const selectChatUser = (state: RootState, user: userFromBackI) => {
  state.chat.users.find((el) => el.user.username == user.username)
}
export const {setUsers, setUserMessages} = chatSlice.actions;
export default chatSlice.reducer;
