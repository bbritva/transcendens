import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useSelector, useStore } from 'react-redux';
import { useAppDispatch } from 'src/app/hooks';
import { RootState } from 'src/store/store';
import { selectIsTwoFAEnabled } from 'src/store/authReducer';
import { login } from 'src/store/authActions';


export default function useTwoFA(
  accessCode: string, accessState: string, inputValue: string
): [
  boolean, Dispatch<SetStateAction<boolean>>, () => void
] {
  const { getState } = useStore();
  const [openTwoFa, setTwoFaOpen] = useState(false);
  const dispatch = useAppDispatch();
  const isTwoFAEnabled = useSelector(selectIsTwoFAEnabled);
  const { auth } = getState() as RootState;

  useEffect(() => {
    if (accessCode) {
      if (!auth.isLoggedIn && isTwoFAEnabled)
        setTwoFaOpen(true);
    }
  }, [isTwoFAEnabled]);

  function login2fa() {
    dispatch(login({ accessCode, accessState, twoFACode: inputValue, user: auth.username }));
    setTwoFaOpen(false);
  }

  return [openTwoFa, setTwoFaOpen, login2fa];
}