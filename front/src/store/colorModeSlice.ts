import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'

interface colorMode {
  mode: 'light' | 'dark'
}

const initialState: colorMode = {
  mode: 'light'
}

const colorModeSlice = createSlice({
  name: 'colorMode',
  initialState,
  reducers: {
    switchMode(state) {
      state.mode = state.mode === 'light'
        ? 'dark'
        : 'light'
    }
  }

})

export const selectMode = (state: RootState) => state.mode.mode;
export const {switchMode} = colorModeSlice.actions;
export default colorModeSlice.reducer;
