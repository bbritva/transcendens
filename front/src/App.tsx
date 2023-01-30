import "src/App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import { createTheme, ThemeProvider, Grid, Box, DialogTitle, Button } from "@mui/material";
import Navbar from 'src/components/Navbar/Navbar';
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import { getUser } from "src/store/userSlice";
import authHeader from "src/services/authHeader";
import { authRefreshInterceptor } from "src/services/authRefreshInterceptor";
import { RootState } from 'src/store/store'
import { selectLoggedIn } from "src/store/authReducer";
import { login, logout } from "src/store/authActions";
import DialogSelect from "./components/DialogSelect/DialogSelect";
import socket, { initSocket } from "./services/socket";
import FormDialog from "./components/FormDialog/FormDialog";
import { channelFromBackI } from "./pages/Chat/ChatPage";


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
  const dispatch = useDispatch();
  const [accessCode, setAccessCode] = useState('');
  const [accessState, setAccessState] = useState('');
  const [inviteSender, setInviteSender] = useState('');
  const [open, setOpen] = useState(false);
  const isLoggedIn = useSelector(selectLoggedIn);
  const [userName, setUsername] = useState<string>('');
  const [channels, setChannels] = useState<channelFromBackI[]>([]);

  let notConnected = true;


  authHeader();
  authRefreshInterceptor();

  useEffect(() => {
    if (userName && notConnected) {
      const { user } = getState() as RootState;

      console.log(userName);
      
      sessionStorage.setItem('username', userName);
      const username = userName;
      socket.auth = { username };
      socket.connect();
      initSocket(setChannels, dispatch);
      notConnected = false;
    }
    // return () => {
    //   socket.disconnect()
    // };
  }, [userName]);

  useEffect(() => {
    const { user } = getState() as RootState;
    if (
      !user.user
      && storageToken.refreshToken !== ""
      && user.status === 'idle'
    ) {
      //@ts-ignore
      dispatch(getUser());
    }
    if (accessCode) {
      if (!isLoggedIn) {
        // @ts-ignore
        dispatch(login({ accessCode, accessState }));
      }
      else {
        // @ts-ignore
        dispatch(getUser());
      }
    }
  }, [accessCode, isLoggedIn]);

  useEffect(() => {
    if (socket.connected){
      console.log('socket invote set');
      socket.on("inviteToGame", (data) => {
        console.log('socket invote RUNNING');
        setInviteSender(data.sender);
        setOpen(true);
      })
    }
  }, [socket?.connected]);

  function onLogoutClick() {
    dispatch(logout());
    window.location.reload();
  };

  function accept() {
    if (socket.connected){
      setOpen(false);
      socket.emit("acceptInvite", { sender: inviteSender })
    }
  }

  function decline () {
    if (socket.connected){
      setOpen(false);
      socket.emit("declineInvite", { sender: inviteSender })
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="landing-background">
      <FormDialog userName={userName} setUsername={setUsername } />
        <Router>
          <Grid container spacing={2} justifyContent="center">
            <Navbar
              loginButtonText="login"
              setAccessCode={setAccessCode}
              setAccessState={setAccessState}
              onLogoutClick={onLogoutClick}
            />
            <Allerts />
            <DialogSelect
              options={{}}
              open={open}
              setOpen={setOpen}
            >
              <Box margin={'1rem'} display={'flex'} flexDirection={'column'} alignItems={'flex-start'}>
                <DialogTitle>NICKNAME invited you</DialogTitle>
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
                    element={<route.component />}
                  />
                ))}
              </Routes>
            </Grid>
          </Grid>
        </Router>
      </div>
    </ThemeProvider>
  );
};

export default App;
