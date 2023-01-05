import { ReactElement, FC, useState, useEffect } from "react";
import { Dialog, Divider, Grid, Paper, useTheme  } from "@mui/material";
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
import FormDialog from "src/components/FormDialog/FormDialog";
import { SettingsSuggestSharp } from "@mui/icons-material";

export interface userFromBackI {
  username: string,
  userID: string,
  connected: boolean,
  hasNewMessages: boolean,
  messages: newMessageI[]
}

export interface newMessageI {
  to: string,
  from: string
  content: string,
  fromSelf: boolean,
}

function useChosenUserState(){
  const [chosenUser, setChosenUser] = useState<userFromBackI>({} as userFromBackI);

  function selectUser(users: userFromBackI[], userId: string){
    const user = users.find((el) => el.userID === userId);
    if (user)
      setChosenUser(user);
  }
  return ({chosenUser, selectUser});
}

function setUserMessages(setUsers: Function, newMessage: newMessageI){
  setUsers((prev: userFromBackI[]) => {
    prev.forEach((user) => {
      console.log("wrong", user.userID, newMessage.from)
      if (user.userID === newMessage?.to || user.userID === newMessage.from) {
        console.log("RIGHT from to", newMessage)
        user.messages = user?.messages?.length
        ? [ ...user.messages, newMessage ]
        : [ newMessage ]
        return ;
      }
    });
    return [...prev];
  });
};


const ChatPage: FC<any> = (): ReactElement => {
  const [userName, setUsername] = useState<string>('');
  const [users, setUsers] = useState<userFromBackI[]>([]);
  const [page, setPage] = useState(0);
  const [value, setValue] = useState('');
  const [chosenChannel, setChosenChannel] = useState({});
  const [loading, setLoading] = useState(false);
  const {chosenUser, selectUser} = useChosenUserState();
  const { getState } = useStore();
  const { user, auth } = getState() as RootState;
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    if (userName) {
      // const username = user.user?.name;
      const username = userName;
      socket.auth = { username };
      socket.connect();

      socket.on("connect_error", (err) => {
        if (err.message === "invalid username") {
          dispatch(logout());
        }
      });

      socket.on("users", (users: userFromBackI[]) => {
        users.splice(users.findIndex(
          (el) => {
            return el.username == user.user?.name}
          ));
        setUsers(users);
      });

      socket.on("user connected", (user: userFromBackI) => {
        setUsers((prev: userFromBackI[]) => [...prev, user]);
      });

      socket.on("private message", (message: newMessageI) => {
        setUserMessages(setUsers, message);
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
      socket.onAny((event, ...args) => {
        console.log(event, args);
      });
    }
    return () => {
      socket.disconnect()
    };
  }, [userName]);

  chatStyles
    .scrollStyle["&::-webkit-scrollbar-thumb"]
    .backgroundColor = theme.palette.primary.light;

  const onSubmit = () => {
    console.log('submit', chosenUser, value);
    if ( !chosenUser.userID ){
      setValue('');
      return ;
    }
    const newMessage: newMessageI = {
      to: chosenUser.userID,
      from: '',
      content: value,
      fromSelf: true
    };
    socket.emit(
      'private message',
      newMessage
    );
    setUserMessages(setUsers, newMessage);
    setValue('');
  };
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

  return (
  <>
    <FormDialog userName={userName} setUsername={setUsername } />
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
          messages={users.find((el) => el.userID === chosenUser.userID)?.messages || []}
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
          setElement={selectUser}
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
  </>
  );
};

export default ChatPage;
