import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAuthorizeHref } from 'src/oauthConfig';
import { getSearchParams, removeAllParamsFromUrl} from 'src/utils/urlUtils';
import { Button } from "@mui/material";
import { selectLoggedIn } from 'src/store/authReducer';


interface AuthorizationProps {
  text: string;
  setCode: (code: string) => void;
  setState: (state: string) => void;
  styleProp: {}
}

const searchParams = getSearchParams();
const accessCode = searchParams?.code;
const accessState = searchParams?.state;
removeAllParamsFromUrl();

export const AuthorizationButton = ({text, setCode, setState, styleProp}: AuthorizationProps) => {
  const isLoggedIn = useSelector(selectLoggedIn);
  const stateArray = new Uint32Array(10);
  self.crypto.getRandomValues(stateArray);/* eslint-disable-line no-restricted-globals */

  useEffect(() => {
    if (accessCode) {
      setCode(accessCode);
      setState(accessState)
    }
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

