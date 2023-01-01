import { ReactElement, FC, useState, useEffect } from "react";
import { Divider, Grid, Paper, useTheme  } from "@mui/material";
import userService from "src/services/user.service";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable, { messageI } from "src/components/OneColumnTable/ChatTable";
import { RootState } from 'src/store/store'
import { useDispatch, useStore } from "react-redux";
import ChatInput from "src/components/ChatInput/ChatInput";
import ChooseDialogChildren from "src/components/DialogSelect/ChooseDialogChildren";
import { chatStyles } from "./chatStyles";
import socket from "src/services/socket";
import { logout } from "src/store/authActions";

export interface userFromBackI {
  username: string,
  userID: string,
  connected: boolean
}

export interface newMessageI {
  to: string,
  from: string
  content: string,
  fromSelf: boolean,
}

const ChatPage: FC<any> = (): ReactElement => {
  const [users, setUsers] = useState<userFromBackI[]>([]);
  const [page, setPage] = useState(0);
  const [messages, setMessages] = useState<newMessageI[]>([]);
  const [value, setValue] = useState('');
  const [chosenUser, setChosenUser] = useState<userFromBackI>({} as userFromBackI);
  const [chosenChannel, setChosenChannel] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const { getState } = useStore();
  const { user, auth } = getState() as RootState;
  const dispatch = useDispatch();
  const theme = useTheme();
  useEffect(() => {
    // userService.getUsers()
    //   .then(res => {
    //     setUsers(res.data.results);
    //     setLoading(false);
    //   })
    //   .catch(err => console.log(err));

  }, [loading]);

  useEffect(() => {
    if (auth.isLoggedIn) {
      const username = user.user?.name;
      socket.auth = { username };
      socket.connect();

      socket.on("connect_error", (err) => {
        if (err.message === "invalid username") {
          dispatch(logout());
        }
      });

      socket.on("users", (users: userFromBackI[]) => {
        setUsers(users);
      });

      socket.on("user connected", (user: userFromBackI) => {
        setUsers((prev: userFromBackI[]) => [...prev, user]);
      });

      socket.on("private message", (message: newMessageI) => {
        //logged user should be instead of chosenUser
        message.fromSelf = chosenUser.userID !== message.from;
        if (message.fromSelf)
          setMessages((prev: newMessageI[]) => [...prev, message]);
      });

      socket.on("connect", () => {
        users.forEach((user) => {
          if (user.userID) {
            user.connected = true;
          }
        });
      });

      socket.on("disconnect", () => {
        users.forEach((user) => {
          if (user.userID) {
            user.connected = false;
          }
        });
      });
    }
    return () => {
      socket.disconnect()
    };
  }, [auth.isLoggedIn]);


  chatStyles
    .scrollStyle["&::-webkit-scrollbar-thumb"]
    .backgroundColor = theme.palette.primary.light;
  const onSubmit = () => {
    // if ( !chosenUser.userID )
    //   return ;
    const newMessage: newMessageI = {
      to: chosenUser.userID,
      from: '',
      content: value,
      fromSelf: true
    };
    socket.emit(
      'newMessage',
      newMessage
    );
    setMessages((prev: newMessageI[]) => [...prev, newMessage]);
    setValue('');
  };
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
  return (
    <Grid container spacing={1}
      height={'60vh'}
      padding={'6px'}
    >
      <Grid item xs={2} height={'100%'}>
        <OneColumnTable
          name='Channels'
          loading={loading}
          elements={users}
          chatStyles={chatStyles}
          selectedElement={chosenChannel}
          setElement={setChosenChannel}
          dialogChildren={
            <ChooseDialogChildren
              dialogName='Channels'
              user={user.user}
              element={chosenChannel}
              channel={chosenChannel}
            />
          }
        />
      </Grid>
      <Grid container item xs={8} height={'100%'} >
        <ChatTable
          name={'Chat'}
          loading={loading}
          messages={messages}
          setMessages={setMessages}
          socket={socket}
          chatStyles={chatStyles}
          user={user.user}
        />
        <Divider />
        <Grid item xs={12} component={Paper} display='flex' 
            minHeight='5%'
            maxHeight='25%'
            borderColor= {theme.palette.secondary.light
        }>
        <ChatInput
          chatStyles={chatStyles}
          value={value}
          setValue={setValue}
          onSubmit={onSubmit}
        />
        </Grid>
      </Grid>
      <Grid item xs={2} height={'100%'}>
        <OneColumnTable
          name='Users'
          loading={loading}
          elements={users}
          chatStyles={chatStyles}
          selectedElement={chosenUser}
          setElement={setChosenUser}
          dialogChildren={
            <ChooseDialogChildren
              dialogName='Users'
              user={user.user}
              element={chosenUser}
              channel={chosenChannel}
            />
          }
        />
      </Grid>
    </Grid>
  );
};

export default ChatPage;