import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userService from "src/services/user.service";
import { RootState } from "src/store/store";


export interface GameI {
  id: number
  winnerId: number
  winnerScore: number
  loserId: number
  loserScore: number
}

interface gamesStateI {
  // Multiple possible status enum values
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | undefined,
  games: GameI[],
  score: number,
  losesNum: number,
  winsNum: number
}

const initialState: gamesStateI = {
  status: 'idle',
  error: undefined,
  games: [],
  score: 0,
  losesNum: 0,
  winsNum: 0
}

export const getGames = createAsyncThunk(
  'getGames',
  async ( userId: number, thunkApi) => {
      const response = await userService.getStats(userId);
      return {
        games: response.data.wins.concat(response.data.loses),
        score: response.data.score,
        losesNum: response.data.loses.length,
        winsNum: response.data.wins.length,
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
  }
})

export const selectGames = (state: RootState) => state.games;
export default gamesSlice.reducer;