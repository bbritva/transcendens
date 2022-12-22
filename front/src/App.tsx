import "src/App.css";
import Navbar from 'src/components/Navbar/Navbar';
import {useEffect, useState} from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import { createTheme, ThemeProvider,Grid } from "@mui/material";
import { selectLoggedIn, selectToken } from "src/store/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { getUser, selectUser } from "src/store/userSlice";
import authHeader from "src/services/authHeader";
import { authRefreshInterceptor } from "./services/authRefreshInterceptor";


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
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isLoggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();
  useEffect(() => {
    if (
      !isLoggedIn 
      && storageToken.refreshToken !== ""
    ){
      authHeader();
      authRefreshInterceptor();
      //@ts-ignore
      dispatch(getUser());
    }
  }, [isLoggedIn]);
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
