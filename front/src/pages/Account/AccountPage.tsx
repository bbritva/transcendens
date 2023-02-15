import {ReactElement, FC} from "react";
import {Box, Typography, Paper, useTheme} from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectUser } from "src/store/userSlice";

const AccountPage: FC<any> = (): ReactElement => {
  const {user, status, error} = useSelector(selectUser);
  const theme = useTheme();

  return (
    <Box
      component={Paper} 

      sx={{
        backgroundColor: theme.palette.secondary.light,
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