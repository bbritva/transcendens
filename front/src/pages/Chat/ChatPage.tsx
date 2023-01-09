import { ReactElement, FC, useState, useEffect } from "react";
import { Divider, FabProps, Grid, Paper, useTheme  } from "@mui/material";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable from "src/components/OneColumnTable/ChatTable";
import { RootState } from 'src/store/store'
import { useDispatch, useStore } from "react-redux";
import ChatInput from "src/components/ChatInput/ChatInput";
import ChooseDialogChildren from "src/components/DialogSelect/ChooseDialogChildren";
import { chatStyles } from "./chatStyles";
import socket, { initSocket } from "src/services/socket";
import FormDialog from "src/components/FormDialog/FormDialog";

export interface fromBackI{
  name: string,
  id: string,
  hasNewMessages: boolean,
  messages: newMessageI[],
  connected: boolean,
}

export interface userFromBackI extends fromBackI{
}

export interface channelFromBackI extends fromBackI{
  users: userFromBackI[],
}

export interface newMessageI {
  id: number | null,
  channelName: string,
  sentAt: string | null,
  authorName: string,
  text: string,
}

function useChosenUserState(){
  const [chosenUser, setChosenUser] = useState<userFromBackI>({} as userFromBackI);

  function selectUser(users: userFromBackI[], id: string){
    const user = users.find((el) => el.id === id);
    if (user)
      setChosenUser(user);
  }
  return ({chosenUser, selectUser});
}

// function setUserMessages(setUsers: Function, newMessage: newMessageI){
//   setUsers((prev: userFromBackI[]) => {
//     prev.forEach((user) => {
//       console.log("wrong", user.id, newMessage.from)
//       if (user.id === newMessage?.to || user.id === newMessage.from) {
//         console.log("RIGHT from to", newMessage)
//         user.messages = user?.messages?.length
//         ? [ ...user.messages, newMessage ]
//         : [ newMessage ]
//         user.hasNewMessages = user.id === newMessage.from;
//         return ;
//       }
//     });
//     return [...prev];
//   });
// };


const ChatPage: FC<any> = (): ReactElement => {
  const [userName, setUsername] = useState<string>('');
  const [users, setUsers] = useState<userFromBackI[]>([]);
  const [channels, setChannels] = useState<channelFromBackI[]>([]);
  const [page, setPage] = useState(0);
  const [value, setValue] = useState('');
  const [chosenChannel, setChosenChannel] = useState({} as channelFromBackI);
  const [loading, setLoading] = useState(false);
  // const {chosenUser, selectUser} = useChosenUserState();
  const [chosenUser, setChosenUser] = useState<userFromBackI>({} as userFromBackI);
  const [destination, setDestination] = useState<[string, fromBackI]>(['', {} as fromBackI]);
  const { getState } = useStore();
  const { user } = getState() as RootState;
  const dispatch = useDispatch();
  const theme = useTheme();
  let flag = true;

  useEffect(() => {
    if (userName && flag) {
      const username = userName;
      socket.auth = { username };
      socket.connect();
      initSocket(user.user, users, setUsers, setChannels, () => {}, dispatch);
      flag = false;
    }
    return () => {
      socket.disconnect()
    };
  }, [userName]);

  chatStyles
    .scrollStyle["&::-webkit-scrollbar-thumb"]
    .backgroundColor = theme.palette.primary.light;

  const onSubmit = () => {
    const [taper, destinationChannel] = destination;
    if ( !destinationChannel.name ){
      setValue('');
      return ;
    }
    const newMessage: newMessageI = {
      id: null,
      channelName: destinationChannel.name,
      sentAt: null,
      authorName: userName,
      text: value,
    };
    socket.emit(
      'newMessage',
      newMessage
    );
    // setUserMessages(setUsers, newMessage);
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
          elements={channels}
          chatStyles={chatStyles}
          selectedElement={chosenChannel}
          setElement={(channel: channelFromBackI) => {
            setDestination(['channel', channel]);
            setChosenChannel(channel);
          }}
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
          messages={channels.find((el) => el.name === chosenChannel.name)?.messages || []}
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
          elements={channels.find((el) => el.name === chosenChannel.name)?.users || []}
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
  </>
  );
};

export default ChatPage;
