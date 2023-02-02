import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "src/services/user.service";
import { RootState } from "src/store/store";


export interface userI {
  id: string,
  name: string,
  image: string,
  avatar: string,
  isTwoFaEnabled: boolean
}

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
  reducers: {
    updateUser(state, action: PayloadAction<userI>){
      state.user = {...state.user, ...action.payload};
    },
  },
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
  }
})

export const selectUser = (state: RootState) => state.user;
export const { updateUser } = userSlice.actions;
export default userSlice.reducer;