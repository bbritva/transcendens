import { useSelector } from "react-redux";
import { NavLink } from 'react-router-dom';
import { Grid, Button, alpha, useTheme } from '@mui/material';
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
  const myHeight = 100;
  return (
    <Grid container item xs={12} justifyContent={'flex-start'}
      sx={{
        background: alpha(theme.palette.secondary.light, 0.45),
        height: myHeight
      }}>
      <Grid item xs={2} />{/* OFFSET */}
      <GridLogo size={myHeight}></GridLogo>
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
            variant={'text'}
            sx={navButtonStyle}
          >
            {page.title == "Account" && user ? user.name : page.title}
          </Button>
        </Grid>
      ))}
      <Grid item
        display={'flex'}
        alignItems={'center'}
        sx={{ display: { xs: "none", sm: "flex" } }}
      >{
          (!user)
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
      </Grid>
    </Grid>
  );
}

export default Navbar;