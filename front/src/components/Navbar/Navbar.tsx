import { Authorization } from 'src/features/authorization/Authorization';
import { useState } from 'react';
import { Box, Grid, Link,  } from '@mui/material';
import { routes } from 'src/routes';
import { NavLink } from 'react-router-dom';
import { GridLogo } from '../Logo/GridLogo';



function Navbar() {
  const [anchorNav, setAnchorNav] = useState(null);
  const myHeight = 100;

  return (
    <Grid container item xs={12} justifyContent={'flex-start'} 
      sx={{
      background:  'rgba(0, 0, 0, 0.4)',
      height: myHeight
      // backgroundColor: 'black',
      // opacity: 0.4,
    }}>
      <Grid item xs={2}/>{/* OFSET */}
      <GridLogo size={ myHeight }></GridLogo>
      {routes.map((page) => (
        <Grid item spacing={4}
          display={'flex'}
          alignItems={'center'}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          <Link
            key={page.key}
            component={NavLink}
            to={page.path}
            color="white"
            underline="hover"
            variant="button"
            sx={{ fontSize: "large", marginLeft: "2rem" }}
          >
            {page.title}
          </Link>
        </Grid>
      ))}
  </Grid>
);
}

export default Navbar;