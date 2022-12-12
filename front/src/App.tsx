import "src/App.css";
import Navbar from 'src/components/Navbar/Navbar';
import {useEffect, useState} from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { routes as appRoutes } from "src/routes";
import Allerts from "src/components/Allerts/Allerts";
import { Grid } from "@mui/material";
import { selectLoggedIn, selectToken, selectUser } from "src/store/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { userI } from "src/store/authReducer";
import { loginSuccess } from "./store/authActions";

function App() {
  let storageUser: userI;
  storageUser = JSON.parse(localStorage.getItem('user') || '{}');
  const storageToken = JSON.parse(localStorage.getItem('token') || '{}');
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isLoggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!isLoggedIn && storageUser?.id){
      console.log('APP ! setUser', storageUser);
      // @ts-ignore
      dispatch(loginSuccess({storageUser, storageToken}));
    }
  }, [isLoggedIn, storageUser?.id]);
  return (
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
  );
};

export default App;
