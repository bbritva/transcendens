import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import {
  Typography,
  AppBar,
  Box,
  useTheme,
} from "@mui/material";
import { routes } from "src/routes";
import { GridLogo } from "src/components/Logo/GridLogo";
import { selectUser } from "src/store/userSlice";
import Protected from "../Authentication/Protected";
import { Container } from "@mui/system";
import { StyledNavButton } from "../NavButton/StyledNavButton";
import NavButton from "../NavButton/NavButton";
import BasicMenu from "../BasicMenu/BasicMenu";


interface NavbarProps {
  loginButtonText: string;
  onLoginClick: React.MouseEventHandler;
  onLogoutClick: () => void;
}

function Navbar({ loginButtonText, onLoginClick, onLogoutClick }: NavbarProps) {
  // const [anchorNav, setAnchorNav] = useState(null); //will use it for menu
  const { user, status, error } = useSelector(selectUser);
  const theme = useTheme();
  const myHeight = "10vh";

  return (
    <AppBar position="sticky">
      <Container>
        <Box sx={{ flexGrow: 1, display: { xs: "flex" } }}>
          <GridLogo size={100}></GridLogo>
          {routes.map((page) => (
            <NavButton page={page}>
              {page.title == "Account" && user ? user.name : page.title}
            </NavButton>
          ))}
          <Protected
            user={user}
            render={() => (
              <BasicMenu/>
  
            )}
            fail={() => (
              <StyledNavButton 
                variant={"text"}
                onClick={onLoginClick}
              >
                <Typography color="secondary">{loginButtonText}</Typography>
              </StyledNavButton>
            )}
          />
        </Box>
      </Container>
    </AppBar>
  );
}

export default Navbar;
