import { Grid, ListItemText, Paper, alpha, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { chatStylesI } from "src/pages/Chat/chatStyles";
import { userI } from "src/store/userSlice";


export interface messageI {
  header: {
    JWTtoken: string,
    userName: string,
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
  chatStyles: chatStylesI,
  user: userI | null
}> = ({ name, loading, messages, setMessages ,socket, chatStyles, user}): ReactElement => {
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
  const isLoggedUser = (userName: string) => userName === user?.name 
  return (
    <Grid container
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
        {
          loading
            ? 'LOADING'
            : messages.map((data) => {
              return (
                <Grid item xs={12}
                  key={crypto.randomUUID()}
                >
                    <ListItemText
                      primary={data.text}
                      primaryTypographyProps={{
                        variant: "body2",
                      }}
                      secondary={data.header.userName + ' at ' + data.header.sentAt.getDate()}
                      secondaryTypographyProps={{
                        variant: "subtitle2"
                      }}
                      sx={{
                        float: isLoggedUser(data.header.userName)
                          ? "right"
                          : "left",
                        padding: "2%",
                        margin: "5px",
                        maxWidth: "50%",
                        ...chatStyles.scrollStyle,
                        ...chatStyles.borderStyle,
                        borderRadius: "1rem",
                        backgroundColor: isLoggedUser(data.header.userName)
                          ? alpha(theme.palette.secondary.light, 0.25)
                          : alpha(theme.palette.primary.light, 0.25)
                      }}
                    />
                </Grid>
              );
            })
        }
    </Grid>
  );
}


export default ChatTable;
