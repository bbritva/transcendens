import { useSelector } from "react-redux";
import { Typography, AppBar, Box, useTheme } from "@mui/material";
import { routes } from "src/routes";
import { GridLogo } from "src/components/Logo/GridLogo";
import { selectUser } from "src/store/userSlice";
import Protected from "../Authentication/Protected";
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
      <Box sx={{ flexGrow: 1, display: { xs: "flex" } }}>
        <GridLogo size={100}></GridLogo>
        {routes.map(
          (page) =>
            page.title !== "Account" && (
              <NavButton key={page.key} page={page}>{page.title}</NavButton>
            )
        )}
        <Box marginLeft={"auto"} marginRight={'2rem'} display='flex'>
          <Protected
            user={user}
            render={() => <BasicMenu onLogout={onLogoutClick} />}
            fail={() => (
              <StyledNavButton variant={"text"} onClick={onLoginClick}>
                <Typography color="secondary">{loginButtonText}</Typography>
              </StyledNavButton>
            )}
          />
        </Box>
      </Box>
    </AppBar>
  );
}

export default Navbar;
