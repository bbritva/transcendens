import {ReactElement, FC, useEffect, useState} from "react";
import {Box} from "@mui/material";
import { AuthorizationButton } from "src/features/authorization/Authorization";
import { useDispatch } from "react-redux";
import { login } from 'src/store/authActions'
import SignUp from "src/components/Signup/Signup";

const AccountPage: FC<any> = (): ReactElement => {
  const [accessCode, setAccessCode] = useState('');
  const [accessState, setAccessState] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    if (accessCode){
      console.log('Account Page!', accessCode);
      // @ts-ignore
      dispatch(login(accessCode, accessState));
    }
  }, [accessCode]);

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // display: {sm: 'flex'}
    }}>
      {
        accessCode
        ? <SignUp />
        : <></>
      }
    </Box>
  );
};

export default AccountPage;