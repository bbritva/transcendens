import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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

export const {setMessage, clearMessage} = messageSlice.actions;
export default messageSlice.reducer;

// export default function (state = initialState, action) {
//   const { type, payload } = action;

//   switch (type) {
//     case SET_MESSAGE:
//       return { message: payload };

//     case CLEAR_MESSAGE:
//       return { message: "" };

//     default:
//       return state;
//   }
// }