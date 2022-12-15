import {ReactElement, FC} from "react";
import {Box, Typography} from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectLoggedIn } from "src/store/authReducer";

const AccountPage: FC<any> = (): ReactElement => {
  const isLoggedIn = useSelector(selectLoggedIn);

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      // display: {sm: 'flex'}
    }}>
      {
        !isLoggedIn
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