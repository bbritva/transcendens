import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'src/store/store';
import { newMessageI, userFromBackI } from 'src/pages/Chat/ChatPage';


export interface UserInfoPublic {
  id: number
  name: string;
  image?: string;
  avatar?: string;
  status: any;
  wins?: any;
  loses?: any;
}

export interface chatState {
  friends: UserInfoPublic[],
}

const initialState = {} as chatState;

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<chatState>) {
      state.friends = action.payload.friends;
    },
    // setUserMessages(
    //   state, 
    //   action: PayloadAction<{user: userFromBackI, messages: newMessageI[]}>
    // ) {
    //   const ind = state.friends.findIndex(
    //     (el) => el.user.name == action.payload.user.name
    //   );
    //   state.friends[ind].messages = action.payload.messages;
    // }
  }

})

export const selectFriends = (state: RootState) => state.chat.friends;

export const {setUsers} = chatSlice.actions;
export default chatSlice.reducer;
