import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "src/services/user.service";
import { RootState } from "src/store/store";
import { UserInfoPublic } from "./chatSlice";
import { fromBackI } from "src/pages/Chat/ChatPage";


export interface GameI {
  id: string
  winnerId: number
  winnerScore: number
  loserId: number
  loserScore: number
  winner: UserInfoPublic
  loser: UserInfoPublic
}

interface gamesStateI {
  // Multiple possible status enum values
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | undefined,
  games: GameI[],
  score: number,
  losesNum: number,
  winsNum: number,
  ladder: fromBackI[]
}

const initialState: gamesStateI = {
  status: 'idle',
  error: undefined,
  games: [],
  score: 0,
  losesNum: 0,
  winsNum: 0,
  ladder: []
}

export const getGames = createAsyncThunk(
  'getGames',
  async ( data: {userId: number, set: Function}, thunkApi) => {
      const response = await userService.getStats(data.userId);
      data.set(true);
      return {
        games: response.data.wins.concat(response.data.loses),
        score: response.data.score,
        losesNum: response.data.loses.length,
        winsNum: response.data.wins.length,
      };
  }
)

export const getLadder = createAsyncThunk(
  'getladder',
  async ( thunkApi) => {
      const response = await userService.getLadder();
      return {
        ladder: response.data
      };
  }
)

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getGames.pending, (state, action) => {
        return {
          ...state,
          status: 'loading'
        };
      })
      .addCase(getGames.fulfilled, (state, action) => {
        return {
          ...action.payload as gamesStateI,
          status: 'succeeded'
        }
      })
      .addCase(getGames.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message
      })
      .addCase(getLadder.pending, (state, action) => {
      })
      .addCase(getLadder.fulfilled, (state, action) => {
        state.ladder = action.payload.ladder;
      })
      .addCase(getLadder.rejected, (state, action) => {
      })
  }
})

export const selectGames = (state: RootState) => state.games;
export default gamesSlice.reducer;