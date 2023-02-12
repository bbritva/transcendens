import { useSelector } from "react-redux";
import { NavLink } from 'react-router-dom';
import { Typography, AppBar, Box, Grid, Button, alpha, useTheme } from '@mui/material';
import { routes } from 'src/routes';
import { GridLogo } from 'src/components/Logo/GridLogo';
import { AuthorizationButton } from "src/features/authorization/AuthorizationButton";
import { selectUser } from 'src/store/userSlice';
import { Container } from "@mui/system";


interface NavbarProps {
  loginButtonText: string,
  setAccessCode: (code: string) => void,
  setAccessState: (state: string) => void,
  onLogoutClick: () => void
}

function Navbar({ loginButtonText, setAccessCode, setAccessState, onLogoutClick}: NavbarProps) {
  // const [anchorNav, setAnchorNav] = useState(null); //will use it for menu
  const { user, status, error } = useSelector(selectUser);
  const theme = useTheme();
  const myHeight = '10vh';
  const navButtonStyle = {
    display: { xs: 'none', md: 'flex' },
    fontSize: "large", marginLeft: "2rem",
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    }
  } as const;
  return (
    <AppBar position="sticky"
      // sx={{
      //   background: alpha(theme.palette.secondary.light, 0.45)
      // }}
      >
        <Container>
      <Box sx={{ flexGrow: 1, display: { xs: 'flex' } }}>
      <GridLogo size={100}></GridLogo>
      {routes.map((page) => (
          <Button
            key={page.key}
            component={NavLink}
            to={page.path}
            variant={'text'}
            sx={navButtonStyle}
          >
            <Typography  color="secondary">
              {page.title == "Account" && user ? user.name : page.title}
            </Typography>
          </Button>

      ))}
          {(!user)
            ? <AuthorizationButton
              text={loginButtonText}
              setCode={setAccessCode}
              setState={setAccessState}
              styleProp={navButtonStyle}
            />
            : <Button
              sx={navButtonStyle}
              variant={'outlined'}
              onClick={onLogoutClick}
            >
              Logout
            </Button>
}
</Box>
      </Container>
    </AppBar>
  );
}

export default Navbar;