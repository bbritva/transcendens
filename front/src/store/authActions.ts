import { Dispatch } from "@reduxjs/toolkit";
import AuthService from "src/services/auth.service";
import { setMessage } from "src/store/messageSlice";
import { createAction } from '@reduxjs/toolkit';
import { userI } from "./authReducer";

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

export const loginSuccess = createAction<{user: userI, accessToken: {}}>('LOGIN_SUCCESS');
export const loginFail = createAction('LOGIN_FAIL');

export const login = (accessCode: string, accessState: string) => (dispatch: Dispatch) => {
  return AuthService.login(accessCode, accessState)
    .then(
      (data) => {
        console.log('loginSuccess', data);
        const myPayload = { user: data.userData, accessToken: data.tokenData };
        dispatch(loginSuccess(myPayload));

        return Promise.resolve();
      },
      (error) => {
        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        console.log('loginFail', error);
        dispatch(loginFail());

        dispatch(setMessage(message));

        return Promise.reject();
      }
    )
};

export const logout = createAction('LOGOUT', function prepare() {
  AuthService.logout();
  return {payload: {}};
});
