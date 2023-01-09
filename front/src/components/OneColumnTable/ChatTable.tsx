import { Box, Grid, Paper, Typography, alpha, useTheme } from "@mui/material";
import { ReactElement, FC, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { newMessageI } from "src/pages/Chat/ChatPage";
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
  messages: newMessageI[],
  socket: Socket,
  chatStyles: chatStylesI,
  user: userI | null
}> = ({ name, loading, messages, socket, chatStyles, user }): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
  const scroll = tableRef?.current;
  useEffect(() => {
    if (scroll && !loading) {
      // @ts-ignore
      scroll.scrollTop = scroll.scrollHeight;
    }
  }, [messages?.length]);
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
        messages.map((data) => {
            return (
              <Grid item xs={12}
                key={data.id}
              >
                <Box
                  sx={{
                    float: data.authorName === user?.name
                      ? "right"
                      : "left",
                    padding: "2%",
                    margin: "5px",
                    maxWidth: "75%",
                    ...chatStyles.borderStyle,
                    borderRadius: "1rem",
                    backgroundColor: data.authorName === user?.name
                      ? alpha(theme.palette.secondary.light, 0.25)
                      : alpha(theme.palette.primary.light, 0.25)
                  }}
                >
                  <Typography
                    children={data.text}
                    variant="body2"
                    sx={{
                      overflowWrap: "anywhere",
                    }}
                  ></Typography>
                  <Typography
                    children={'at ' + data.sentAt?.getDate}
                    variant="subtitle2"
                  ></Typography>
                </Box>
              </Grid>
            );
          })
      }
    </Grid>
  );
}


export default ChatTable;
