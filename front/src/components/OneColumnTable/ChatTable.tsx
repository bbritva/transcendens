import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from "@mui/material";
import { ReactElement, FC, useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { chatStylesI } from "src/pages/Chat/chatStyles";


export interface messageI {
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
  messages: messageI[],
  setMessages: Function,
  socket: Socket,
  chatStyles: chatStylesI
}> = ({ name, loading, messages, setMessages ,socket, chatStyles}): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected!');
    });
    socket.on('onMessage', (newMessage: messageI) => {
      console.log('onMessage event received!');
      console.log(newMessage);
      setMessages((prev: messageI[]) => [...prev, newMessage]);
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
  return (
    <TableContainer
      ref={tableRef}
      component={Paper}
      sx={{
        minHeight: '75%',
        maxHeight: '85%',
        marginBottom: "5px",
        ...chatStyles.borderStyle,
        ...chatStyles.scrollStyle
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
