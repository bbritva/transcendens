import "src/App.css";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector, useStore } from "react-redux";
import { createTheme, ThemeProvider, Grid } from "@mui/material";
import Navbar from 'src/components/Navbar/Navbar';
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import { getUser } from "src/store/userSlice";
import authHeader from "src/services/authHeader";
import { authRefreshInterceptor } from "src/services/authRefreshInterceptor";
import { RootState } from 'src/store/store'
import { selectLoggedIn } from "src/store/authReducer";
import { login, logout } from "src/store/authActions";


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
  const isLoggedIn = useSelector(selectLoggedIn);
  authHeader();
  authRefreshInterceptor();
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
  function onLogoutClick() {
    dispatch(logout());
    window.location.reload();
  };
  return (
    <ThemeProvider theme={theme}>
      <div className="landing-background">
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
