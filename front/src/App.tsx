import "src/App.css";
import { ReactEventHandler, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import { createTheme, ThemeProvider, Grid, DialogTitle, TextField, Button } from "@mui/material";
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
import { Box } from "@mui/system";


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
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const isLoggedIn = useSelector(selectLoggedIn);
  const isTwoFAEnabled = useSelector(selectIsTwoFAEnabled);
  authHeader();
  authRefreshInterceptor();
  useEffect(() => {
    const { user, auth } = getState() as RootState;
    if (
      !user.user
      && storageToken.refreshToken !== ""
      && user.status === 'idle'
    ) {
      //@ts-ignore
      dispatch(getUser());
    }
    if (accessCode) {
      if (!isLoggedIn && auth.isTwoFAEnabled){
        setOpen(true);
      }
      else if (!auth.isLoggedIn) {
        // @ts-ignore
        dispatch(login({ accessCode, accessState }));
      }
      else {
        // @ts-ignore
        dispatch(getUser());
      }
    }
  }, [accessCode, isLoggedIn, isTwoFAEnabled]);

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
        <Router>
          <Grid container spacing={2} justifyContent="center">
            <Navbar
              loginButtonText="login"
              setAccessCode={setAccessCode}
              setAccessState={setAccessState}
              onLogoutClick={onLogoutClick}
            />
            <Allerts />
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
