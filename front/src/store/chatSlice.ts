import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from 'src/store/store';


export interface UserInfoPublic {
  id: string
  name: string;
  image: string;
  avatar?: string;
  status: any;
  wins: any;
  loses: any;
}

export interface chatState {
  friends: UserInfoPublic[],
  banned: UserInfoPublic[],
}

const initialState = {
  friends: [],
  banned: []
} as chatState;

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setFriends(state, action: PayloadAction<UserInfoPublic[]>) {
      state.friends = action.payload;
    },
    deleteFriend(state, action: PayloadAction<UserInfoPublic>) {
      state.friends = state.friends.filter((friend) => friend.id !== action.payload.id);
    },
    setBanned(state, action: PayloadAction<UserInfoPublic[]>) {
      state.banned = state.banned.concat(action.payload);
    },
    deleteBanned(state, action: PayloadAction<UserInfoPublic>) {
      state.banned = state.banned.filter((friend) => friend.id !== action.payload.id);
    },
  }

})

export const selectFriends = (state: RootState) => state.chat.friends;
export const selectBanned = (state: RootState) => state.chat.banned;

export const {setFriends, deleteFriend, setBanned, deleteBanned} = chatSlice.actions;
export default chatSlice.reducer;
