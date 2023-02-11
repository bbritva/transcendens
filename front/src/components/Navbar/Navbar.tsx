import { useSelector } from "react-redux";
import { NavLink } from 'react-router-dom';
import { AppBar, Box, Grid, Button, alpha, useTheme } from '@mui/material';
import { routes } from 'src/routes';
import { GridLogo } from 'src/components/Logo/GridLogo';
import { AuthorizationButton } from "src/features/authorization/AuthorizationButton";
import { selectUser } from 'src/store/userSlice';


export const navButtonStyle = {
  fontSize: "large", marginLeft: "2rem", color: 'white',
  '&:hover': {
    backgroundColor: '#fff',
    color: '#3c52b2'
  }
} as const;

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
  return (
    <AppBar position="sticky"
      sx={{
        background: alpha(theme.palette.secondary.light, 0.45),
        height: myHeight
      }}>
      {/* <GridLogo size={100}></GridLogo> */}
      {routes.map((page) => (
          <Button
            key={page.key}
            component={NavLink}
            to={page.path}
            variant={'text'}
            sx={navButtonStyle}
          >
            {page.title == "Account" && user ? user.name : page.title}
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
    </AppBar>
  );
}

export default Navbar;