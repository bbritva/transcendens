
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { useDispatch, useStore } from "react-redux";
import { createTheme, ThemeProvider,Grid } from "@mui/material";
import "src/App.css";
import Navbar from 'src/components/Navbar/Navbar';
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import { getUser, selectUser } from "src/store/userSlice";
import authHeader from "src/services/authHeader";
import { authRefreshInterceptor } from "src/services/authRefreshInterceptor";
import { RootState } from 'src/store/store'


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
  authHeader();
  authRefreshInterceptor();
  useEffect(() => {
    const { user } = getState() as RootState;
    console.log('App getUser', user);
    if (
      ! user.user
      && storageToken.refreshToken !== ""
      && user.status === 'idle'
    ){
      //@ts-ignore
      dispatch(getUser());
    }
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <div className="landing-background">
        <Router>
          <Grid container spacing={2} justifyContent="center">
            <Navbar />
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
