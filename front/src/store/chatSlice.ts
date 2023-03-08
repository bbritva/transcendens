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
  banned: UserInfoPublic[],
}

const initialState = {} as chatState;

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<UserInfoPublic[]>) {
      state.friends = action.payload;
    },
    setBanned(state, action: PayloadAction<UserInfoPublic[]>) {
      state.banned = action.payload;
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
export const selectBanned = (state: RootState) => state.chat.banned;

export const {setUsers, setBanned} = chatSlice.actions;
export default chatSlice.reducer;
