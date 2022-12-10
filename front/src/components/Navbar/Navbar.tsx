import { Authorization } from 'src/features/authorization/Authorization';
import { useState } from 'react';
import { Box, Link,  } from '@mui/material';
import { routes } from 'src/routes';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';



function Navbar() {
  const [anchorNav, setAnchorNav] = useState(null);

  return (
      <div className="navbar-container">
        <div className="navbar">
          <div className="logo-text">PONG</div>
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
              ))}
            </Box>
          </Box>
        </div>
      </div>
  );
}

export default Navbar;