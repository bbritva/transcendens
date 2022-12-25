import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store';

interface MessageState {
  message: string
}

const initialState: MessageState = {
  message: ''
}

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    clearMessage(state){
      state.message = '';
    }
  }

})

export const selectMessage = (state: RootState) => state.message;
export const {setMessage, clearMessage} = messageSlice.actions;
export default messageSlice.reducer;
