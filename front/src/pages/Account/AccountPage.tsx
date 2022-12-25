import {ReactElement, FC} from "react";
import {Box, Typography} from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectLoggedIn } from "src/store/authReducer";
import { selectUser } from "src/store/userSlice";

const AccountPage: FC<any> = (): ReactElement => {
  const isLoggedIn = useSelector(selectLoggedIn);
  const {user, status, error} = useSelector(selectUser);

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // display: {sm: 'flex'}
    }}>
      {
        !user
        ? 
          <>
            <Typography variant="h4" margin={5}>
              You should log in!
            </Typography>
          </>
        : <SignUp />
      }
    </Box>
  );
};

export default AccountPage;