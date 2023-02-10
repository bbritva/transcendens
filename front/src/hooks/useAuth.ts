import { useEffect, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { useAppDispatch } from 'src/app/hooks';
import { RootState } from 'src/store/store';
import { getUser } from 'src/store/userSlice';
import { getSearchParams, removeAllParamsFromUrl } from 'src/utils/urlUtils';
import socket, { initSocket } from "src/services/socket";
import { login, loginSuccess } from 'src/store/authActions';
import { selectIsTwoFAEnabled, selectLoggedIn } from 'src/store/authReducer';

const intraOAuthParams = getSearchParams();
const accessCode = intraOAuthParams?.code;
const accessState = intraOAuthParams?.state;
removeAllParamsFromUrl();
console.log(intraOAuthParams)


export default function useAuth(setTwoFaOpen: (arg0: boolean) => void): [string, string] {
  const { getState } = useStore();
  const dispatch = useAppDispatch();
  const isLoggedIn = useSelector(selectLoggedIn);
  const isTwoFAEnabled = useSelector(selectIsTwoFAEnabled);
  const storageToken = {
    refreshToken: localStorage.getItem('refreshToken') || ''
  };
  const { user, auth } = getState() as RootState;

  if (
    !isLoggedIn &&
    auth.status === 'idle'
  ) {
    if (accessCode){
      dispatch(login({ accessCode, accessState, twoFACode: undefined, user: undefined}));
    }
    if (
      storageToken.refreshToken &&
      user.status === 'idle'
    ){
      dispatch(getUser());
    }
  }

  useEffect(() => {
    if (
      isLoggedIn &&
      user.status === 'idle'
    )
      dispatch(getUser());
  }, [isLoggedIn]);

  useEffect(() => {
    if (accessCode) {
      if (!auth.isLoggedIn && isTwoFAEnabled){
        setTwoFaOpen(true);
      }
    }
  }, [ isLoggedIn, isTwoFAEnabled]);

  return [accessCode, accessState];
}