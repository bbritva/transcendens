import { Authorization } from 'src/features/authorization/Authorization';
import { useState } from 'react';
import { Box, Grid, Link,  } from '@mui/material';
import { routes } from 'src/routes';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';
import { GridLogo } from '../Logo/Logo';



function Navbar() {
  const [anchorNav, setAnchorNav] = useState(null);

  return (
    <Grid container item xs={12} justifyContent={'flex-start'} sx={{
      backgroundColor: 'transparent'
    }}>
        <GridLogo />
        {routes.map((page) => (
          <Grid item spacing={4}>
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