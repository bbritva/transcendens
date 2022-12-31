import { ReactElement, FC, useState, useEffect } from "react";
import { Divider, Grid, Paper, useTheme  } from "@mui/material";
import userService from "src/services/user.service";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable, { messageI } from "src/components/OneColumnTable/ChatTable";
import { RootState } from 'src/store/store'
import { useStore } from "react-redux";
import { io, Socket } from 'socket.io-client';
import ChatInput from "src/components/ChatInput/ChatInput";
import ChooseDialogChildren from "src/components/DialogSelect/ChooseDialogChildren";
import { chatStyles } from "./chatStyles";


export const socket = io('http://localhost:3000');
// export const WebsocketContext = createContext<Socket>(socket);


const ChatPage: FC<any> = (): ReactElement => {
  const [users, setUsers] = useState<[{
    name: string, model: string
  }]>([{ name: '', model: '' }]);
  const [page, setPage] = useState(0);
  const [messages, setMessages] = useState<messageI[]>([]);
  const [value, setValue] = useState('');
  const [chosenUser, setChosenUser] = useState({});
  const [chosenChannel, setChosenChannel] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const { getState } = useStore();
  const { user, auth } = getState() as RootState;
  const theme = useTheme();
  useEffect(() => {
    userService.getUsers()
      .then(res => {
        setUsers(res.data.results);
        setLoading(false);
      })
      .catch(err => console.log(err));
  }, [loading]
  );
  chatStyles
    .scrollStyle["&::-webkit-scrollbar-thumb"]
    .backgroundColor = theme.palette.primary.light;
  const onSubmit = () => {
    const newMessage = 
      {
        header: {
          // @ts-ignore
          JWTtoken: auth.accessToken.access_token,
          userName: user.user?.name,
          sentAt: new Date(),
          channel: '',
        },
        text: value
      };
    // @ts-ignore
    setMessages((prev: messageI[]) => [...prev, newMessage]);
    socket.emit(
      'newMessage',
      newMessage
    );
    console.log('newMessage', value);
    setValue('');
  };
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