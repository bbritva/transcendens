import "src/App.css";
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useSelector, useStore } from "react-redux";
import { createTheme, ThemeProvider, Grid, DialogTitle, TextField, Button, Box, Stack, PaletteMode} from "@mui/material";
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
import { selectMode } from "./store/colorModeSlice";
import { getDesignTokens } from "./theme";
import StyledBackground from "./StyledBackground";

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
  const mode = useSelector(selectMode);

  const theme = createTheme(getDesignTokens(mode));
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
      <StyledBackground>
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
                      <route.component channels={channels} setChannels={setChannels} gameData={gameData} setGameData={setGameData}/>
                    </PrivateRouteWrapper>
                  }
                />
              ))}
            </Routes>
          </Grid>
      </StyledBackground>
    </ThemeProvider>
  );
};

export default App;
