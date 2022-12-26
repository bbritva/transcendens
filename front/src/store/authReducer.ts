import { createReducer } from '@reduxjs/toolkit';
import authHeader from 'src/services/authHeader';
import { login, loginFail, loginSuccess, logout, refresh, registerFail, registerSuccess, userSuccess } from 'src/store/authActions';
import { RootState } from 'src/store/store'


export interface authState {
  isLoggedIn: boolean,
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  accessToken: {
    access_token: string,
    refreshToken: string
  }
}

const initialState: authState = {
  isLoggedIn: false,
  status: 'idle',
  accessToken: {access_token: '', refreshToken: ''}
}

const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(refresh.pending, (state, action) => {
      return {
        ...state,
        status: 'loading'
      };
    })
    .addCase(refresh.fulfilled, (state, action) => {
      localStorage.setItem("access_token", JSON.stringify(action.payload.access_token));
      localStorage.setItem("refreshToken", JSON.stringify(action.payload.refreshToken));
      state.accessToken = action.payload;
      return {
        ...state,
        accessToken: action.payload,
        status: 'succeeded'
      };
    })
    .addCase(refresh.rejected, (state, action) => {
      return {
        ...state,
        status: 'failed'
      };
    })
    .addCase(login.fulfilled, (state, action) => {
      state.isLoggedIn = true;
      state.accessToken = action.payload;
      authHeader();
    })
    .addCase(login.rejected, (state, action) => {
      state.isLoggedIn = false;
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
      state.accessToken = {
        access_token: '',
        refreshToken: ''
      }
    })
    .addCase(logout, (state, action) => {
      state.isLoggedIn = false;
      state.accessToken = {
        access_token: '',
        refreshToken: ''
      }
    })
});

export const selectToken = (state: RootState) => state.auth.accessToken;
export const selectLoggedIn = (state: RootState) => state.auth.isLoggedIn;

export default authReducer;