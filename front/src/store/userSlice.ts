import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userFromBackI } from "src/pages/Chat/ChatPage";
import userService from "src/services/user.service";
import { RootState } from "src/store/store";


export interface userI {
  id: string,
  name: string
  image: string
}

interface userStateI {
  // Multiple possible status enum values
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | undefined,
  user: userI | null,
  friendsStatus: 'idle' | 'loading' | 'succeeded' | 'failed',
  friends: userFromBackI[]
}

const initialState: userStateI = {
  status: 'idle',
  error: undefined,
  user: null,
  friendsStatus: 'idle',
  friends: [] as userFromBackI[]
}

export const getUser = createAsyncThunk(
  'getUser',
  async () => {
    const response = await userService.getMe()
    return response.data;
  }
)


export const getFriends = createAsyncThunk(
  'getFriends',
  async () => {
    const response = await userService.getUsers()
    return response.data;
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getUser.pending, (state, action) => {
        return {
          ...state,
          status: 'loading'
        };
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message
      })
      .addCase(getFriends.pending, (state, action) => {
        return {
          ...state,
          friendsStatus: 'loading'
        };
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.friendsStatus = 'succeeded'
        state.friends = action.payload;
      })
      .addCase(getFriends.rejected, (state, action) => {
        state.friendsStatus = 'failed';
        state.error = action.error.message
      })
  }
})

export const selectUser = (state: RootState) => state.user;
export default userSlice.reducer