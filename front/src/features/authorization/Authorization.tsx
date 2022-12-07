import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setLoggedIn,
  setAccessToken,
  setTokenExpiryDate,
  selectIsLoggedIn,
  selectTokenExpiryDate,
} from './authorizationSlice';
// import { setUserProfileAsync } from '../spotifyExample/spotifyExampleSlice';
import { getAuthorizeHref, getToken } from '../../oauthConfig';
import { getHashParams, getSearchParams, removeHashParamsFromUrl , removeAllParamsFromUrl} from '../../utils/urlUtils';

const hashParams = getHashParams();
const access_token = hashParams.access_token;
const expires_in = hashParams.expires_in;
removeHashParamsFromUrl();

const searchParams = getSearchParams();
const access_code = searchParams?.code;
const access_state = searchParams?.state;
removeAllParamsFromUrl();
console.log(searchParams);

export const Authorization = (props: { text?: string, className?: string }) => {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const tokenExpiryDate = useSelector(selectTokenExpiryDate);
  const dispatch = useDispatch();
  const stateArray = new Uint32Array(10);
  self.crypto.getRandomValues(stateArray);/* eslint-disable-line no-restricted-globals */

  useEffect(() => {
    if (access_code) {
      console.log('Token ', getToken(access_code));
    }
    if (access_token) {
      dispatch(setLoggedIn(true));
      dispatch(setAccessToken(access_token));
      dispatch(setTokenExpiryDate(Number(expires_in)));
      // dispatch(setUserProfileAsync(access_token));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return (
    <div>
      {!isLoggedIn &&
        <div
        className={`${props.className || ""}`}
        onClick={() => window.open(getAuthorizeHref(stateArray), '_self')}
        >
          {props.text || "Authorization"}
        </div>}
      {isLoggedIn && <div>Token expiry date: {tokenExpiryDate}</div>}
    </div>
  );
}

