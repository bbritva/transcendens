import { Authorization } from 'src/features/authorization/Authorization';
import { useState } from 'react';
import { Box, Grid, Link,  } from '@mui/material';
import { routes } from 'src/routes';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';



function Navbar() {
  const [anchorNav, setAnchorNav] = useState(null);

  // return (
      // <div className="navbar-container">
      //   <div className="navbar">
  return (
    <Grid container xs={12} justifyContent="center">
        <div className="logo-text">PONG</div>
      <Grid container item xs={6} justifyContent="center">
        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "flex" } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              marginLeft: "1rem",
            }}
          >
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
          </Box>
        </Box>
        </Grid>
    </Grid>
  );
      //   </div>
      // </div>
  // );
}

export default Navbar;