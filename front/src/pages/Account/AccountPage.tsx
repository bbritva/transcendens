import {ReactElement, FC, useEffect, useState} from "react";
import {Box, Typography} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { login } from 'src/store/authActions'
import SignUp from "src/components/Signup/Signup";
import { selectLoggedIn, selectToken, selectUser } from "src/store/authReducer";

const AccountPage: FC<any> = (): ReactElement => {
  const [accessCode, setAccessCode] = useState('');
  const [accessState, setAccessState] = useState('');
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isLoggedIn = useSelector(selectLoggedIn);
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
        isLoggedIn
        ? <>
            <Typography variant="h4" margin={5}>
              {user.name}
            </Typography>
            <Box
              component="img"
              src={user.image}
              sx={{
                height: 233,
                width: 350,
                maxHeight: { xs: 433},
                maxWidth: { xs: 650},
              }}
              alt="The house from the offer."
            />
          </>
        : <SignUp />
      }
    </Box>
  );
};

export default AccountPage;