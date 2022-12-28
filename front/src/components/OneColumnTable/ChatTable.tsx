import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
import { ReactElement, FC, useState, useRef, useEffect } from "react";
import { useStore } from "react-redux";
import { Socket } from "socket.io-client";
import { RootState } from 'src/store/store'


interface messageI {
  header: {
    JWTtoken: string,
    useerName: string,
    sentAt: Date,
    channel: string,
  },
  text: string
}

const ChatTable: FC<{
  name: string,
  loading: boolean,
  elements: [{ name: string, model: string }],
  getName: boolean,
  socket: Socket
}> = ({ name, loading, elements, getName = true, socket }): ReactElement => {
  const [value, setValue] = useState('');
  const [messages, setMessages] = useState<messageI[]>([]);
  const theme = useTheme();
  const tableRef = useRef(null);
  const { getState } = useStore();
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected!');
    });
    socket.on('onMessage', (newMessage: messageI) => {
      console.log('onMessage event received!');
      console.log(newMessage);
      setMessages((prev) => [...prev, newMessage]);
    });
    return () => {
      console.log('Unregistering Events...');
      socket.off('connect');
      socket.off('onMessage');
    };
  }, []);
  const scroll = tableRef?.current;
  if (scroll && !loading) {
    // @ts-ignore
    scroll.scrollTop = scroll.scrollHeight;
  }
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
    <TableContainer
      ref={tableRef}
      component={Paper}
      sx={{
        border: "2px solid rgba(0,0,0,0.2)",
        minHeight: '75%',
        maxHeight: '85%',
        "&::-webkit-scrollbar": {
          width: 3
        },
        "&::-webkit-scrollbar-track": {
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.primary.light,
          borderRadius: 2
        },
        marginBottom: "5px",
        overflow: 'scroll',
        overflowAnchor: 'none',
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <Table>
        <TableHead>{name}</TableHead>
        <TableBody
          sx={{
            display: "-ms-inline-grid",
          }}
        >
          {
            loading
              ? 'LOADING'
              : messages.map((data) => {
                return (
                  <TableRow
                    key={crypto.randomUUID()}
                    sx={{
                    }}
                  >
                    <TableCell
                      component={'th'}
                      scope="row"
                      sx={{
                      }}
                    >
                      {data.text}
                    </TableCell>
                  </TableRow>);
              })
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}


export default ChatTable;
