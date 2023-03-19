import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserStatusI } from 'src/pages/Chat/ChatPage';
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
      state.friends = state.friends.concat(action.payload);
    },
    setFriendStatus(state, action: PayloadAction<UserStatusI>) {
      for (let i = 0; i < state.friends.length; i++) {
        if (state.friends[i].id === action.payload.id){
          state.friends[i].status = action.payload.status;
          break ;
        }
      }
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

export const {setFriends, deleteFriend, setBanned, deleteBanned, setFriendStatus} = chatSlice.actions;
export default chatSlice.reducer;
