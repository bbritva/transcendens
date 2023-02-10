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


  useEffect(() => {
    console.log({accessCode});
    const storageToken = {
      refreshToken: localStorage.getItem('refreshToken') || ''
    };
    const { user, auth } = getState() as RootState;
    if (
      !isLoggedIn
      && storageToken.refreshToken !== ""
    ) {
      dispatch(getUser());
    }
    if (accessCode) {
      console.log(auth);
      if (!auth.isLoggedIn && isTwoFAEnabled){
        setTwoFaOpen(true);
      }
      else if (!auth.isLoggedIn)
        dispatch(login({ accessCode, accessState, twoFACode: undefined, user: undefined}));
      else
        dispatch(getUser());
    }
  }, [accessCode, isLoggedIn,isTwoFAEnabled]);

  return [accessCode, accessState];
}