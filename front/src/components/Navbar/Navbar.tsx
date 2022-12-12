import { useState, useEffect } from 'react';
import { Box, Grid, Link, Button, makeStyles} from '@mui/material';
import { routes } from 'src/routes';
import { NavLink } from 'react-router-dom';
import { GridLogo } from '../Logo/GridLogo';
import { AuthorizationButton } from "src/features/authorization/Authorization";
import { useDispatch } from "react-redux";
import { login } from 'src/store/authActions'

export const navButtonStyle = {
  fontSize: "large", marginLeft: "2rem", color: 'white', 
  '&:hover': {
    backgroundColor: '#fff',
    color: '#3c52b2'
  }
} as const;


function Navbar() {
  const [anchorNav, setAnchorNav] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [accessState, setAccessState] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    if (accessCode){
      console.log('Account Page!', accessCode);
      // @ts-ignore
      dispatch(login(accessCode, accessState));
    }
  }, [accessCode]);
  const myHeight = 100;
  return (
    <Grid container item xs={12} justifyContent={'flex-start'} 
      sx={{
      background:  'rgba(0, 0, 0, 0.4)',
      height: myHeight
    }}>
      <Grid item xs={2}/>{/* OFFSET */}
      <GridLogo size={ myHeight }></GridLogo>
      {routes.map((page) => (
        <Grid item spacing={4}
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
            {page.title}
          </Button>
        </Grid>
      ))}
      <Grid item spacing={4}
        display={'flex'}
        alignItems={'center'}
        sx={{ display: { xs: "none", sm: "flex" } }}
      >{
        !accessCode
        ? <AuthorizationButton 
            text='Click to login' 
            setCode={setAccessCode} 
            setState={setAccessState} 
            styleProp={navButtonStyle}
          />
        : <></>
      }
      </Grid>
  </Grid>
);
}

export default Navbar;