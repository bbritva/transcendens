import {ReactElement, FC, useState} from "react";
import {Box, Grid, Typography} from "@mui/material";
import { useSelector } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectLoggedIn } from "src/store/authReducer";
import { selectUser } from "src/store/userSlice";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import { userFromBackI } from "src/pages/Chat/ChatPage";
import { chatStyles } from "../Chat/chatStyles";

const AccountPage: FC<any> = (): ReactElement => {
  const isLoggedIn = useSelector(selectLoggedIn);
  const {user, status, error} = useSelector(selectUser);
  const [friends, setFriends] = useState<userFromBackI[]>([] as userFromBackI[]);
  const [friend, setFriend] = useState<userFromBackI>({} as userFromBackI);

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
    }}>
      {
        !user
        ? 
          <Typography variant="h4" margin={5}>
            You should log in!
          </Typography>
        :
        <>
          <Grid item xs={2}>
            <OneColumnTable name="your friends" loading={true} elements={friends} chatStyles={chatStyles} selectedElement={friend} setElement={setFriend} dialogChildren={<></>} />
          </Grid>
          <Grid item xs={10}>
            <SignUp />
          </Grid>
        </>
      }
    </Box>
  );
};

export default AccountPage;