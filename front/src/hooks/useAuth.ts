import { useEffect, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { useAppDispatch } from 'src/app/hooks';
import { RootState } from 'src/store/store';
import { getUser } from 'src/store/userSlice';
import { getSearchParams, removeAllParamsFromUrl } from 'src/utils/urlUtils';
import { login } from 'src/store/authActions';
import { selectIsTwoFAEnabled } from 'src/store/authReducer';
import { useSearchParams } from 'react-router-dom';


export default function useAuth(): [string, string] {
  const { getState } = useStore();
  const dispatch = useAppDispatch();
  const isTwoFAEnabled = useSelector(selectIsTwoFAEnabled);
  const storageToken = {
    refreshToken: localStorage.getItem('refreshToken') || ''
  };
  const { user, auth } = getState() as RootState;

  const [searchParams, setSearchParams] = useSearchParams();
  const accessCode = searchParams.get("code") || '';
  const accessState = searchParams.get("state") || '';
  searchParams.delete("code");
  searchParams.delete("state");

  if (
    !auth.isLoggedIn &&
    auth.status === 'idle'
  ) {
    if (accessCode)
      dispatch(login({ accessCode, accessState, twoFACode: undefined, user: undefined }));
    if (
      storageToken.refreshToken &&
      user.status === 'idle'
    ) dispatch(getUser());
  }

  useEffect(() => {
    if (
      auth.isLoggedIn &&
      user.status === 'idle'
    )
      dispatch(getUser());
  }, [auth.isLoggedIn]);

  return [accessCode, accessState];
}