import { Dispatch } from "@reduxjs/toolkit";
import AuthService from "src/services/auth.service";
import { setMessage } from "src/store/messageSlice";
import { createAction } from '@reduxjs/toolkit';

export const registerFail = createAction('REGISTER_FAIL')
export const registerSuccess = createAction('REGISTER_SUCCESS')

export const register = (username:string, email:string, password:string) => (dispatch: Dispatch) => {
  return AuthService.register(username, email, password).then(
    (response) => {
      dispatch(registerSuccess());

      dispatch(setMessage(response.data.message));

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch(registerFail());

      dispatch(setMessage(message));

      return Promise.reject();
    }
  );
};

export const loginSuccess = createAction<{user: {}}>('LOGIN_SUCCESS');
export const loginFail = createAction('LOGIN_FAIL');

export const login = (username:string, password:string) => (dispatch: Dispatch) => {
  return AuthService.login(username, password).then(
    (data) => {
      dispatch(loginSuccess(data));

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch(loginFail());

      dispatch(setMessage(message));

      return Promise.reject();
    }
  );
};

export const logout = createAction('LOGOUT', function prepare() {
  AuthService.logout();
  return {payload: {}};
});
