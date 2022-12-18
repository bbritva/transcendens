import { createReducer } from '@reduxjs/toolkit';
import authHeader from 'src/services/authHeader';
import { loginFail, loginSuccess, logout, registerFail, registerSuccess, userSuccess} from 'src/store/authActions';
import { RootState } from './store'

// const storageData = localStorage.getItem("user") || '{}';
// const user = JSON.parse(storageData);

export interface userI {
  id: string,
  name: string
  image: string
}

interface authState {
  isLoggedIn: boolean,
  user: userI,
  accessCode: string,
  accessToken: {}
}

const initialState: authState = {
  isLoggedIn: false,
  user: {id: '', name: '', image: ''},
  accessCode: '',
  accessToken: {access_token: '', refreshToken: ''}
}

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
      state.accessToken = action.payload;
    })
    .addCase(userSuccess, (state, action) => {
      state.isLoggedIn = true;
      state.user = {id: action.payload.user.id, name: action.payload.user.name, image: action.payload.user.image};
      authHeader();
    })
    .addCase(loginFail, (state, action) => {
      state.isLoggedIn = false;
      state.user = {id: '', name: '', image: ''};
      state.accessToken = {}
    })
    .addCase(logout, (state, action) => {
      state.isLoggedIn = false;
      state.user = {id: '', name: '', image: ''};
      state.accessToken = {}
    })
});

export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.accessToken;
export const selectLoggedIn = (state: RootState) => state.auth.isLoggedIn;

export default authReducer;