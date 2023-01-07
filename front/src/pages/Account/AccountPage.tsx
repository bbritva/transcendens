import {ReactElement, FC, useState, useEffect} from "react";
import {Box, Grid, Typography} from "@mui/material";
import { useDispatch, useSelector, useStore } from "react-redux";
import SignUp from "src/components/AccountUpdate/AccountUpdate";
import { selectLoggedIn } from "src/store/authReducer";
import { getFriends, selectUser } from "src/store/userSlice";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import { userFromBackI } from "src/pages/Chat/ChatPage";
import { chatStyles } from "../Chat/chatStyles";
import { AppDispatch } from "src/store/store";

const AccountPage: FC<any> = (): ReactElement => {
  const isLoggedIn = useSelector(selectLoggedIn);
  const {user, status, error, friendsStatus, friends} = useSelector(selectUser);
  const [friend, setFriend] = useState<userFromBackI>({} as userFromBackI);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (user && friendsStatus === 'idle'){
      dispatch(getFriends())
    }
  }, [user, friendsStatus]);

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
            <OneColumnTable name="your friends" loading={friendsStatus != "succeeded"} elements={friends} chatStyles={chatStyles} selectedElement={friend} setElement={setFriend} dialogChildren={<></>} />
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