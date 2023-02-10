import { createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "src/services/auth.service";
import { createAction } from '@reduxjs/toolkit';
import { AxiosError } from "axios";


export interface twoFaResponseDataI{
  username: string;
}

export const userSuccess = createAction('USER_SUCCESS', ({user}) => {
  return {payload: {
    user
  }};
})

export const loginSuccess = createAction(
  'LOGIN_SUCCESS',
  () => {
  return {payload: {
    isLoggedIn: true
  }};
})

export const loginFail = createAction('LOGIN_FAIL');

export const login = createAsyncThunk(
  'login',
  async (data: {
    accessCode: string,
    accessState: string,
    twoFACode: string | undefined,
    user: string | undefined
  }, thunkApi) => {
    if (data.twoFACode && data.user){
      const test = await AuthService.otpAuth(data.twoFACode, data.user);
      return test;
    }
    try{
      const response = await AuthService.login(data.accessCode, data.accessState);
      return response;
    }
    catch (error){
      const err = error as AxiosError;
      if (err?.response?.status === 418){
        const {username} = err.response.data as twoFaResponseDataI;
        return thunkApi.rejectWithValue({
          username
        });
      }
      throw error;
    }
  }
)

export const refresh = createAsyncThunk(
  'refresh',
  async(data, thunkApi) => {
    const response = await AuthService.refresh();
    return response.data;
  }
)

export const logout = createAction('LOGOUT', function prepare() {
  AuthService.logout();
  return {payload: {}};
});
