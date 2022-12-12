import { createReducer } from '@reduxjs/toolkit';
import { loginFail, loginSuccess, logout, registerFail, registerSuccess } from 'src/store/authActions';
import { RootState } from './store'

// const storageData = localStorage.getItem("user") || '{}';
// const user = JSON.parse(storageData);

export interface userI {
  id: string,
  name: string
}

interface authState {
  isLoggedIn: boolean,
  user: userI,
  accessCode: string,
  accessToken: {}
}

const initialState: authState = {
  isLoggedIn: false,
  user: {id: '', name: ''},
  accessCode: '',
  accessToken: {}
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
      state.user = {id: action.payload.user.id, name: action.payload.user.name};
      state.accessToken = action.payload.accessToken;
    })
    .addCase(loginFail, (state, action) => {
      state.isLoggedIn = false;
      state.user = {id: '', name: ''};
      state.accessToken = {}
    })
    .addCase(logout, (state, action) => {
      state.isLoggedIn = false;
      state.user = {id: '', name: ''};
      state.accessToken = {}
    })
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.accessToken;
export const selectLoggedIn = (state: RootState) => state.auth.isLoggedIn;

export default authReducer;