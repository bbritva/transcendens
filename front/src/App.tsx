import "src/App.css";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSelector, useStore } from "react-redux";
import { createTheme, ThemeProvider, Grid, DialogTitle, TextField, Button, Box, Stack} from "@mui/material";
import Navbar from 'src/components/Navbar/Navbar';
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import authHeader from "src/services/authHeader";
import { authRefreshInterceptor } from "src/services/authRefreshInterceptor";
import { RootState } from 'src/store/store'
import { selectLoggedIn } from "src/store/authReducer";
import { logout } from "src/store/authActions";
import DialogSelect from "./components/DialogSelect/DialogSelect";
import socket, { initSocket } from "src/services/socket";
import FormDialog from "src/components/FormDialog/FormDialog";
import { channelFromBackI } from "src/pages/Chat/ChatPage";
import { useAppDispatch } from "src/app/hooks";
import PrivateRouteWrapper from "src/components/Authentication/PrivateRouteWrapper";
import { getAuthorizeHref } from 'src/utils/oauthConfig';
import useAuth from "src/hooks/useAuth";
import useTwoFA from "src/hooks/useTwoFA";
import { GameStateDataI } from "src/pages/Game/components/game/game";


const theme = createTheme({
  palette: {
    primary: {
      //light 
      main: '#56a2b8',
      //dark
      // contrastText: '#ffcc00',
    },
    secondary: {
      main: '#ecebd9',
    },
    info: {
      main: '#8bd4d1'
    }
  },
  typography: {
    fontFamily: 'Raleway, Arial',
    fontSize: 16, //px or rem
    h4: {
      fontSize: 16,
      color: 'primary',
    },
  },
});

// const theme = createTheme({
//   // typography: {
//     poster: {
//       fontSize: 64,
//       color: 'red',
//     },


// Variants
// The typography object comes with 13 variants by default:

// h1
// h2
// h3
// h4
// h5
// h6
// subtitle1
// subtitle2
// body1
// body2
// button
// caption
// overline


// import { useTheme } from '@mui/material/styles';

// function DeepChild() {
//   const theme = useTheme();
//   return <span>{`spacing ${theme.spacing}`}</span>;
// }

// const theme = createTheme();

// theme.typography.h3 = {
//   fontSize: '1.2rem',
//   '@media (min-width:600px)': {
//     fontSize: '1.5rem',
//   },
//   [theme.breakpoints.up('md')]: {
//     fontSize: '2.4rem',
//   },
// };

// const theme = createTheme({
//   typography: {
//     subtitle1: {
//       fontSize: 12,
//     },
//     body1: {
//       fontWeight: 500,
//     },
//     button: {
//       fontStyle: 'italic',
//     },
//   },
// });

function App() {
  const { getState } = useStore();
  const dispatch = useAppDispatch();
  const [openNick, setOpenNick] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inviteSender, setInviteSender] = useState('');
  const isLoggedIn = useSelector(selectLoggedIn);
  const [userName, setUsername] = useState<string>('');
  const [channels, setChannels] = useState<channelFromBackI[]>([]);
  const [gameData, setGameData] = useState<GameStateDataI | null>(null);

  authHeader();
  authRefreshInterceptor();
  const [accessCode, accessState] = useAuth();
  const [openTwoFa, setTwoFaOpen, login2fa] = useTwoFA(accessCode, accessState, inputValue);
  const navigate = useNavigate();
  let notConnected = true;


  function connectUser(tokenConnect: {}) {
    socket.auth = tokenConnect;
    socket.connect();
    initSocket(navigate, setGameData, setChannels, dispatch);
  }

  useEffect(() => {
    const { auth } = getState() as RootState;
    if (isLoggedIn) {
      connectUser({ token: auth.accessToken.access_token });
    }
    else if (userName && notConnected) {
      sessionStorage.setItem('username', userName);
      connectUser({ username: userName });
      notConnected = false;
    }
    return () => {
      socket.disconnect()
    };
  }, [userName, isLoggedIn]);

  useEffect(() => {
    if (socket.connected) {
      socket.on("inviteToGame", (data) => {
        setInviteSender(data.sender);
        setOpenNick(true);
      })
    }
  }, [socket?.connected]);

  function onLogoutClick() {
    sessionStorage.setItem('username', '');//testUserName
    dispatch(logout());
    window.location.reload();
  };

  function onLoginClick() {
    const stateArray = new Uint32Array(10);
    self.crypto.getRandomValues(stateArray);/* eslint-disable-line no-restricted-globals */
    window.open(getAuthorizeHref(stateArray), '_self')
  }

  function onChange(this: any, event: React.ChangeEvent<HTMLTextAreaElement>): void {
    // event.preventDefault();
    setInputValue(event.currentTarget.value);
  }

  function accept() {
    if (socket.connected) {
      setOpenNick(false);
      socket.emit("acceptInvite", { sender: inviteSender })
      // sessionStorage.setItem("game", "true");
      // navigate('/game', { replace: true });
    }
  }

  function decline() {
    if (socket.connected) {
      setOpenNick(false);
      socket.emit("declineInvite", { sender: inviteSender })
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="landing-background">
        <DialogSelect open={openTwoFa} setOpen={setTwoFaOpen} options>
          <DialogTitle>Enter 2fa code</DialogTitle>
          <TextField label={'otp code'} onChange={onChange} margin="dense" />
          <Button
            variant="outlined"
            sx={{
              alignSelf: 'end'
            }}
            onClick={login2fa}
          >
            Login
          </Button>
        </DialogSelect>
        <FormDialog userName={userName} setUsername={setUsername} />
          <Navbar
            loginButtonText="login"
            onLoginClick={onLoginClick}
            onLogoutClick={onLogoutClick}
          />
          <Allerts />
          <DialogSelect
            options={{}}
            open={openNick}
            setOpen={setOpenNick}
          >
              <DialogTitle>{inviteSender || 'NICKNAME'} invited you</DialogTitle>
              <Button
                variant="outlined"
                sx={{ alignSelf: 'end' }}
                onClick={decline}
              >
                Decline
              </Button>
              <Button
                variant="contained"
                sx={{ alignSelf: 'end' }}
                onClick={accept}
              >
                Accept
              </Button>
          </DialogSelect>
          <Grid display="flex" justifyContent="center" item xs={10} margin={3} sx={{
          }}>
            <Routes>
              {appRoutes.map((route) => (
                <Route
                  key={route.key}
                  path={route.path}
                  element={
                    <PrivateRouteWrapper>
                      <route.component channels={channels} setChannels={setChannels} gameData={gameData}/>
                    </PrivateRouteWrapper>
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
