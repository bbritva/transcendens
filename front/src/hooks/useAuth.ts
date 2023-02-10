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
const intraCode = intraOAuthParams?.code;
const intraState = intraOAuthParams?.state;
removeAllParamsFromUrl();
console.log(intraOAuthParams)


export default function useAuth(setTwoFaOpen: (arg0: boolean) => void): [string, string] {
  const { getState } = useStore();
  const [ accessCode ] = useState<string>(intraCode);
  const [ accessState ] = useState<string>(intraState);
  const dispatch = useAppDispatch();
  const isTwoFAEnabled = useSelector(selectIsTwoFAEnabled);
  const isLoggedIn = useSelector(selectLoggedIn);
  const storageToken = {
    refreshToken: localStorage.getItem('refreshToken') || ''
  };

  useEffect(() => {
    const { user, auth } = getState() as RootState;
    const storageToken = {
      refreshToken: localStorage.getItem('refreshToken') || ''
    };
    if (
      accessCode &&
      !isLoggedIn &&
      auth.status === 'idle'
    ){
      dispatch(login({ accessCode, accessState, twoFACode: undefined, user: undefined}));
    }
  }, [accessCode]);

  useEffect(() => {
    const { user, auth } = getState() as RootState;
    if (
      storageToken.refreshToken &&
      !isLoggedIn &&
      auth.status === 'idle' &&
      user.status === 'idle'
    ){
      dispatch(getUser());
    }
  }, [storageToken.refreshToken]);

  useEffect(() => {
    const { user, auth } = getState() as RootState;
    if (
      isLoggedIn &&
      user.status === 'idle'
    )
      dispatch(getUser());
  }, [isLoggedIn]);

  useEffect(() => {
    const { auth } = getState() as RootState;
    if (accessCode) {
      if (!auth.isLoggedIn && isTwoFAEnabled){
        setTwoFaOpen(true);
      }
    }
  }, [ isLoggedIn, isTwoFAEnabled]);

  return [accessCode, accessState];
}