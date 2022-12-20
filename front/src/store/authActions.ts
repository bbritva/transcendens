import { Dispatch, createAsyncThunk } from "@reduxjs/toolkit";
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

// export const getUser = ( ) => (dispatch: Dispatch) => {
//   return userService.getMe()
//     .then(
//       (response) => {
//         const myPayload = { user: response.data };
//         dispatch(userSuccess(myPayload));

//         return Promise.resolve();
//       },
//       (error) => {
//         const message =
//           (error.response &&
//             error.response.data &&
//             error.response.data.message) ||
//           error.message ||
//           error.toString();
//         console.log('getUserFail', error);
//         dispatch(loginFail());

//         dispatch(setMessage(message));

//         return Promise.reject();
//       }
//     )
// }

export const userSuccess = createAction('USER_SUCCESS', ({user}) => {
  return {payload: {
    user
  }};
})

export const loginSuccess = createAction('LOGIN_SUCCESS', ({access_token, refreshToken}) => {
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

// export const login = (accessCode: string, accessState: string) => (dispatch: Dispatch) => {
//   return AuthService.login(accessCode, accessState)
//     .then(
//       (data) => {
//         const myPayload = { access_token: data.access_token, refreshToken: data.refreshToken};
//         dispatch(loginSuccess(myPayload));

//         return Promise.resolve();
//       },
//       (error) => {
//         const message =
//           (error.response &&
//             error.response.data &&
//             error.response.data.message) ||
//           error.message ||
//           error.toString();
//         console.log('loginFail', error);
//         dispatch(loginFail());

//         dispatch(setMessage(message));

//         return Promise.reject();
//       }
//     )
// };

export const logout = createAction('LOGOUT', function prepare() {
  AuthService.logout();
  return {payload: {}};
});
