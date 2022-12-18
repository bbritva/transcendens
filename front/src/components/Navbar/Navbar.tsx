import { useState, useEffect } from 'react';
import { Box, Grid, Link, Button, makeStyles, Typography, alpha, useTheme} from '@mui/material';
import { routes } from 'src/routes';
import { NavLink } from 'react-router-dom';
import { GridLogo } from '../Logo/GridLogo';
import { AuthorizationButton } from "src/features/authorization/Authorization";
import { useDispatch, useSelector } from "react-redux";
import { getUser, login, logout } from 'src/store/authActions'
import { selectLoggedIn, selectToken, selectUser } from "src/store/authReducer";

export const navButtonStyle = {
  fontSize: "large", marginLeft: "2rem", color: 'white', 
  '&:hover': {
    backgroundColor: '#fff',
    color: '#3c52b2'
  }
} as const;


function Navbar() {
  // const [anchorNav, setAnchorNav] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [accessState, setAccessState] = useState('');
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isLoggedIn = useSelector(selectLoggedIn);
  const dispatch = useDispatch();
  const theme = useTheme();
  useEffect(() => {
    if (accessCode){
      // @ts-ignore
      dispatch(login(accessCode, accessState));
      // @ts-ignore
      dispatch(getUser());
    }
  }, [accessCode]);
  const myHeight = 100;
  return (
    <Grid container item xs={12} justifyContent={'flex-start'} 
      sx={{
      // background:  'rgba(0, 0, 0, 0.4)',
      background:  alpha(theme.palette.secondary.light , 0.45),
      height: myHeight
    }}>
      <Grid item xs={2}/>{/* OFFSET */}
      <GridLogo size={ myHeight }></GridLogo>
      {routes.map((page) => (
        <Grid item
          key={page.key + 1}
          display={'flex'}
          alignItems={'center'}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          <Button
            key={page.key}
            component={NavLink}
            to={page.path}
            // color={'secondary'}
            variant={'text'}
            // variant="button"
            sx={navButtonStyle}
          >
            {page.title == "Account" && isLoggedIn ? user.name : page.title }
          </Button>
        </Grid>
      ))}
      <Grid item 
        display={'flex'}
        alignItems={'center'}
        sx={{ display: { xs: "none", sm: "flex" } }}
      >{
        !isLoggedIn
        ? <AuthorizationButton 
            text='Click to login' 
            setCode={setAccessCode} 
            setState={setAccessState} 
            styleProp={navButtonStyle}
          />
        : <>
            <Button 
              sx={navButtonStyle}
              variant={'outlined'}
              onClick={() => {
                dispatch(logout());
                window.location.reload();
              }}
            >
              Logout
            </Button>
          </>
      }
      </Grid>
  </Grid>
);
}

export default Navbar;