import { createReducer } from '@reduxjs/toolkit';
import authHeader from 'src/services/authHeader';
import { login, loginFail, loginSuccess, logout, refresh, registerFail, registerSuccess, userSuccess} from 'src/store/authActions';
import { RootState } from 'src/store/store'

// const storageData = localStorage.getItem("user") || '{}';
// const user = JSON.parse(storageData);

export interface userI {
  id: string,
  name: string
  image: string
}


export interface authState {
  isLoggedIn: boolean,
  accessToken: {}
}

const initialState: authState = {
  isLoggedIn: false,
  accessToken: {access_token: '', refreshToken: ''}
}

const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(refresh.pending, (state, action) => {
      console.log('REFRESH pending', action);
    })
    .addCase(refresh.fulfilled, (state, action) => {
      console.log('REFRESH succeeded', action);
      localStorage.setItem("access_token", JSON.stringify(action.payload.access_token));
      localStorage.setItem("refreshToken", JSON.stringify(action.payload.refreshToken));
      state.accessToken = action.payload;
    })
    .addCase(refresh.rejected, (state, action) => {
      console.log('REFRESH pending', action);
    })
    .addCase(login.fulfilled, (state, action) => {
      console.log('newLogin OK',action);
      state.isLoggedIn = true;
      state.accessToken = action.payload;
      console.log(state.accessToken);
      authHeader();
    })
    .addCase(login.rejected, (state, action) => {
      state.isLoggedIn = false;
      console.log('newLogin FAILED', action);
    })
    .addCase(registerSuccess, (state, action) => {
      state.isLoggedIn = false;
    })
    .addCase(registerFail, (state, action) => {
      state.isLoggedIn = false;
    })
    .addCase(loginSuccess, (state, action) => {
      state.isLoggedIn = true;
      state.accessToken = action.payload;
      authHeader();
    })
    .addCase(userSuccess, (state, action) => {
      state.isLoggedIn = true;
    })
    .addCase(loginFail, (state, action) => {
      state.isLoggedIn = false;
      state.accessToken = {}
    })
    .addCase(logout, (state, action) => {
      state.isLoggedIn = false;
      state.accessToken = {}
    })
});

export const selectToken = (state: RootState) => state.auth.accessToken;
export const selectLoggedIn = (state: RootState) => state.auth.isLoggedIn;

export default authReducer;