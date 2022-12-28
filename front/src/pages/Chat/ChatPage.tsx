import React, { ReactElement, FC, useState, useEffect } from "react";
import { Box, Container, CssBaseline, Divider, Grid, IconButton, InputAdornment, OutlinedInput, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography,useTheme  } from "@mui/material";
import userService from "src/services/user.service";
import OneColumnTable from "src/components/OneColumnTable/OneColumnTable";
import ChatTable from "src/components/OneColumnTable/ChatTable";
import { RootState } from 'src/store/store'
import { useStore } from "react-redux";
import { io, Socket } from 'socket.io-client';
import SendIcon from '@mui/icons-material/Send';


export const socket = io('http://localhost:3000');
// export const WebsocketContext = createContext<Socket>(socket);

const chatStyles = {
  commonSection: {
    width: '100%',
    height: '100vh'
  }
}

const ChatPage: FC<any> = (): ReactElement => {
  const [users, setUsers] = useState<[{ name: string, model: string }]>([{ name: '', model: '' }]);
  const [page, setPage] = useState(0);
  const [value, setValue] = useState('');
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
          getName={false}
        />
      </Grid>
      <Grid item xs={2} height={'100%'}>
        <OneColumnTable
          name={'Users'}
          loading={loading}
          elements={users}
          getName={true}
        />
      </Grid>
      <Grid container item xs={8} height={'100%'} >
        <ChatTable
          name={'Chat'}
          loading={loading}
          elements={users}
          getName={false}
          socket={socket}
        />
        <Divider />
        <Grid item xs={12} component={Paper} display='flex' 
            minHeight='5%'
            maxHeight='25%'
            borderColor= {theme.palette.secondary.light}
        >
        <OutlinedInput
          id="outlined-adornment-enter"
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter')
              onSubmit();
          }}
          value={value}
          type={'text'}
          fullWidth
          multiline
          maxRows={'3'}
          sx={{
            ".MuiOutlinedInput-notchedOutline": {
              border: "2px solid rgba(0,0,0,0.2)",
            },
            ".MuiInputBase-input" :{
              overflow: 'hidden',
            },
          }}
          endAdornment={
            <InputAdornment position="end" sx={{
            }}>
              <IconButton
                aria-label="toggle password visibility"
                onClick={onSubmit}
                edge="end"
              >
                <SendIcon sx={{
                  color:theme.palette.primary.light,
                  }}/>
              </IconButton>
            </InputAdornment>
          }
        /></Grid>
      </Grid>
    </Grid>
  );
};

export default ChatPage;