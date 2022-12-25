import { createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "src/services/auth.service";
import { createAction } from '@reduxjs/toolkit';


export const registerFail = createAction('REGISTER_FAIL')
export const registerSuccess = createAction('REGISTER_SUCCESS')

export const userSuccess = createAction('USER_SUCCESS', ({user}) => {
  return {payload: {
    user
  }};
})

export const loginSuccess = createAction(
  'LOGIN_SUCCESS',
  ({access_token, refreshToken}) => {
  return {payload: {
    access_token,
    refreshToken
  }};
})

export const loginFail = createAction('LOGIN_FAIL');

export const login = createAsyncThunk(
  'login',
  async (data: {accessCode: string, accessState: string}, thunkApi) => {
    const response = await AuthService.login(data.accessCode, data.accessState);
    return response;
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
