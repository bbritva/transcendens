import { createReducer } from '@reduxjs/toolkit';
import { loginFail, loginSuccess, logout, registerFail, registerSuccess } from 'src/store/authActions';

// const storageData = localStorage.getItem("user") || '{}';
// const user = JSON.parse(storageData);

interface authState {
  isLoggedIn: boolean,
  user: {},
  accessCode: string,
  accessToken: string
}

const initialState: authState = {
  isLoggedIn: false,
  user: {},
  accessCode: '',
  accessToken: ''
}
// const initialState: authState = user
//   ? { isLoggedIn: true, user }
//   : { isLoggedIn: false, user: '' };

const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(registerSuccess, (state, action) => {
      state.isLoggedIn = false;
    })
    .addCase(registerFail, (state, action) => {
      state.isLoggedIn = false;
    })
    .addCase(loginSuccess, (state, action) => {
      state.isLoggedIn = true;
      state.user = {name: 'IamUSER!'};
      state.accessToken = action.payload.accessToken;
    })
    .addCase(loginFail, (state, action) => {
      state.isLoggedIn = false;
      state.user = {};
    })
    .addCase(logout, (state, action) => {
      state.isLoggedIn = false;
      state.user = {};
    })
});

export default authReducer;