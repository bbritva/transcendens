import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "src/services/user.service";
import { userI } from "./authReducer";
import { RootState } from "./store";

interface userStateI {
  // Multiple possible status enum values
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | undefined,
  user: userI | null
}

const initialState: userStateI = {
  status: 'idle',
  error: undefined,
  user: null
}

export const getUser = createAsyncThunk(
  'getUser',
  async () => {
    const response = await userService.getMe()
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
        console.log('getUser pending', action);
        return {
          ...state,
          status: 'loading'
        };
      })
      .addCase(getUser.fulfilled, (state, action) => {
        console.log('getUser succeeded', action);
        state.status = 'succeeded'
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        console.log('getUser pending', action);
        state.status = 'failed';
        state.error = action.error.message
      })
  }
})

export const selectUser = (state: RootState) => state.user;
export default userSlice.reducer