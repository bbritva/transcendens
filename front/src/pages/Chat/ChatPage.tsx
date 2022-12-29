import { ReactElement, FC, useState, useEffect } from "react";
import { Divider, Grid, Paper, useTheme  } from "@mui/material";
import userService from "src/services/user.service";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable from "src/components/OneColumnTable/ChatTable";
import { RootState } from 'src/store/store'
import { useStore } from "react-redux";
import { io, Socket } from 'socket.io-client';
import ChatInput from "src/components/ChatInput/ChatInput";


export const socket = io('http://localhost:3000');
// export const WebsocketContext = createContext<Socket>(socket);

export interface chatStylesI{
  borderStyle: {
    border: string,
  },
  scrollStyle: {
    overflow: string,
    "&::-webkit-scrollbar": {
      width: number
    },
    "&::-webkit-scrollbar-track": {
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: string
      borderRadius: number
    },
    overflowAnchor: string,
    overflowX: string,
  },
  textElipsis: {
    overflow: string,
    textOverflow: string,
    display: string,
    WebkitLineClamp: number,
    WebkitBoxOrient: string
  }

}

const chatStyles:chatStylesI = {
  borderStyle: {
    border: "2px solid rgba(0,0,0,0.2)",
  },
  scrollStyle: {
    overflow: 'scroll',
    "&::-webkit-scrollbar": {
      width: 3
    },
    "&::-webkit-scrollbar-track": {
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: '',
      borderRadius: 2
    },
    overflowAnchor: 'none',
    overflowX: "hidden",
  },
  textElipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical"
  }
}

const ChatPage: FC<any> = (): ReactElement => {
  const [users, setUsers] = useState<[{
    name: string, model: string
  }]>([{ name: '', model: '' }]);
  const [page, setPage] = useState(0);
  const [value, setValue] = useState('');
  const [user, setUser] = useState({});
  const [channel, setChannel] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const { getState } = useStore();
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
    const { user, auth } = getState() as RootState;
    console.log(auth);
    socket.emit(
      'newMessage',
      {
        header: {
          // @ts-ignore
          JWTtoken: auth.accessToken.access_token,
          // JWTtoken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NzM3MjUsInVzZXJuYW1lIjoidHBodW5nIiwiaWF0IjoxNjcyMDYwMDY2LCJleHAiOjE2NzIwNjAwNzZ9.Oc3ZGIdZutyOyIo1h2t0cMZZ5MbBnOuAhg23_z1OVjA',
          userName: user.user?.name,
          sentAt: new Date(),
          channel: '',
        },
        text: value
      }
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
          name={'Channels'}
          loading={loading}
          elements={users}
          chatStyles={chatStyles}
          selectedElement={channel}
          setElement={setChannel}
        />
      </Grid>
      <Grid item xs={2} height={'100%'}>
        <OneColumnTable
          name={'Users'}
          loading={loading}
          elements={users}
          chatStyles={chatStyles}
          selectedElement={user}
          setElement={setUser}
        />
      </Grid>
      <Grid container item xs={8} height={'100%'} >
        <ChatTable
          name={'Chat'}
          loading={loading}
          elements={users}
          getName={false}
          socket={socket}
          chatStyles={chatStyles}
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
    </Grid>
  );
};

export default ChatPage;