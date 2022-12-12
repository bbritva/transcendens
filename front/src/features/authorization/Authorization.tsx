import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsLoggedIn,
  selectTokenExpiryDate,
} from 'src/store/authorizationSlice';
// import { setUserProfileAsync } from '../spotifyExample/spotifyExampleSlice';
import { getAuthorizeHref, getToken } from 'src/oauthConfig';
import { getHashParams, getSearchParams, removeHashParamsFromUrl , removeAllParamsFromUrl} from 'src/utils/urlUtils';
import {Box, Typography, Button} from "@mui/material";


interface AuthorizationProps {
  text: string;
  setCode: (code: string) => void;
  setState: (state: string) => void;
  styleProp: {}
}

const hashParams = getHashParams();
const access_token = hashParams.access_token;
const expires_in = hashParams.expires_in;
removeHashParamsFromUrl();

const searchParams = getSearchParams();
const accessCode = searchParams?.code;
const accessState = searchParams?.state;
removeAllParamsFromUrl();
console.log(searchParams);

export const AuthorizationButton = ({text, setCode, setState, styleProp}: AuthorizationProps) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const tokenExpiryDate = useSelector(selectTokenExpiryDate);
  const dispatch = useDispatch();
  const stateArray = new Uint32Array(10);
  self.crypto.getRandomValues(stateArray);/* eslint-disable-line no-restricted-globals */

  useEffect(() => {
    if (accessCode) {
      console.log('Authorization!', accessCode);
      setCode(accessCode);
      setState(accessState)
      // console.log('Token ', getToken(accessCode));
    }
    // if (access_token) {
    //   dispatch(setLoggedIn(true));
    //   dispatch(setAccessToken(access_token));
    //   dispatch(setTokenExpiryDate(Number(expires_in)));
    //   dispatch(setUserProfileAsync(access_token));
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessCode]);

  return (
    <>
      {
        !isLoggedIn &&
        <Button
          variant='outlined'
          onClick={() => window.open(getAuthorizeHref(stateArray), '_self')}
          sx={styleProp}
        >
          {text || "Authorization"}
        </Button>
      }
    </>
  );
}

