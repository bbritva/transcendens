import "src/App.css";
import { ReactEventHandler, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSelector, useStore } from "react-redux";
import { createTheme, ThemeProvider, Grid, DialogTitle, TextField, Button, Box, Stack} from "@mui/material";
import Navbar from 'src/components/Navbar/Navbar';
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import { getUser } from "src/store/userSlice";
import authHeader from "src/services/authHeader";
import { authRefreshInterceptor } from "src/services/authRefreshInterceptor";
import { RootState } from 'src/store/store'
import { selectIsTwoFAEnabled, selectLoggedIn } from "src/store/authReducer";
import { login, logout } from "src/store/authActions";
import DialogSelect from "./components/DialogSelect/DialogSelect";
import socket, { initSocket } from "src/services/socket";
import FormDialog from "src/components/FormDialog/FormDialog";
import { channelFromBackI } from "src/pages/Chat/ChatPage";
import { useAppDispatch } from "src/app/hooks";


const theme = createTheme({
  palette: {
    primary: {
      main: '#283593',
    },
    secondary: {
      main: '#e91e63',
    },
  },
});

function App() {
  const storageToken = {
    refreshToken: localStorage.getItem('refreshToken') || ''
  };
  const { getState } = useStore();
  const dispatch = useAppDispatch();
  const [accessCode, setAccessCode] = useState('');
  const [accessState, setAccessState] = useState('');
  const [openNick, setOpenNick] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inviteSender, setInviteSender] = useState('');
  const [open, setOpen] = useState(false);
  const isLoggedIn = useSelector(selectLoggedIn);
  const isTwoFAEnabled = useSelector(selectIsTwoFAEnabled);
  const [userName, setUsername] = useState<string>('');
  const [channels, setChannels] = useState<channelFromBackI[]>([]);
  const navigate = useNavigate();
  let notConnected = true;


  authHeader();
  authRefreshInterceptor();

  function connectUser(tokenConnect: {}) {
    socket.auth = tokenConnect;
    socket.connect();
    initSocket(setChannels, dispatch);
  }

  useEffect(() => {
    if (userName && notConnected) {
      sessionStorage.setItem('username', userName);
      connectUser({ username: userName });
      notConnected = false;
    }
    return () => {
      socket.disconnect()
    };
  }, [userName]);

  useEffect(() => {
    const { user, auth } = getState() as RootState;
    if (
      !user.user
      && storageToken.refreshToken !== ""
      && user.status === 'idle'
    ) {
      dispatch(getUser());
    }
    if (accessCode) {
      if (!isLoggedIn && auth.isTwoFAEnabled){
        setOpen(true);
      }
      else if (!auth.isLoggedIn)
        //@ts-ignore
        dispatch(login({ accessCode, accessState }));
      else
        dispatch(getUser());
    }
    if (isLoggedIn)
      connectUser({ token: auth.accessToken.access_token });
  }, [accessCode, isLoggedIn, isTwoFAEnabled]);


  useEffect(() => {
    if (socket.connected){
      console.log('socket invote set');
      socket.on("inviteToGame", (data) => {
        console.log('socket invote RUNNING');
        setInviteSender(data.sender);
        setOpenNick(true);
      })
    }
  }, [socket?.connected]);

  function onLogoutClick() {
    dispatch(logout());
    window.location.reload();
  };
  function onChange(this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
  }
  function login2fa(){
    const { auth } = getState() as RootState;
    // @ts-ignore
    dispatch(login({ accessCode, accessState, twoFACode: inputValue, user: auth.username }));
    setOpen(false);
  }

  function accept() {
    if (socket.connected){
      setOpenNick(false);
      socket.emit("acceptInvite", { sender: inviteSender })
      sessionStorage.setItem("game", "true");
      navigate('/game',  {replace: true});
    }
  }

  function decline() {
    if (socket.connected){
      setOpenNick(false);
      socket.emit("declineInvite", { sender: inviteSender })
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="landing-background">
        <DialogSelect open={open} setOpen={setOpen} options>
          <Box margin={'1rem'} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
            <DialogTitle>Enter 2fa code</DialogTitle>
            <TextField label={'otp code'} onChange={onChange} margin="dense"/>
            <Button
              variant="outlined"
              sx={{
                alignSelf: 'end'
              }}
              onClick={login2fa}
            >
              Login
            </Button>
          </Box>
        </DialogSelect>
      <FormDialog userName={userName} setUsername={setUsername } />

            <Navbar
              loginButtonText="login"
              setAccessCode={setAccessCode}
              setAccessState={setAccessState}
              onLogoutClick={onLogoutClick}
            />
            <Allerts />
            <DialogSelect
              options={{}}
              open={openNick}
              setOpen={setOpenNick}
            >
              <Box margin={'1rem'} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
                <DialogTitle>{inviteSender || 'NICKNAME'} invited you</DialogTitle>
                <Button
                  variant="outlined"
                  sx={{alignSelf: 'end'}}
                  onClick={decline}
                >
                  Decline
                </Button>
                <Button
                  variant="contained"
                  sx={{alignSelf: 'end'}}
                  onClick={accept}
                >
                  Accept
                </Button>
              </Box>
            </DialogSelect>
            <Grid item xs={8} margin={10} sx={{
            }}>
              <Routes>
                {appRoutes.map((route) => (
                  <Route
                    key={route.key}
                    path={route.path}
                    element={
                      <Stack height='70vh' direction="row" spacing={2} justifyContent="space-between">
                        <route.component channels={channels} setChannels={setChannels}/>
                      </Stack>
                    }
                  />
                ))}
              </Routes>
            </Grid>

      </div>
    </ThemeProvider>
  );
};

export default App;
