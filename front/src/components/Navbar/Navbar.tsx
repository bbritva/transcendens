import { useSelector } from "react-redux";
import { Typography, AppBar, Box, useTheme } from "@mui/material";
import { routes } from "src/routes";
import { GridLogo } from "src/components/Logo/GridLogo";
import { selectUser } from "src/store/userSlice";
import Protected from "src/components/Authentication/Protected";
import { StyledNavButton } from "src/components/NavButton/StyledNavButton";
import NavButton from "src/components/NavButton/NavButton";
import BasicMenu from "src/components/BasicMenu/BasicMenu";
import { StyledMenuItem } from "src/components/BasicMenu/StyledMenu";
import { useNavigate } from "react-router-dom";
import { FC, useEffect, useState } from "react";

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
  const navigate = useNavigate();
  const [avatarSource, setAvatarSource] = useState<string>('');

  useEffect(() => {
    const test = user?.avatar;

    if (test){
      setAvatarSource(
        process.env.REACT_APP_USERS_URL + `/avatar/${test}`
      )
    }
    else if (user)
      setAvatarSource(user.image);
  }, [user?.avatar]);

  const buttons = [
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/account", { replace: true }),
        children: user?.name || "Profile"
      }
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/", { replace: true }),
        children: "Home"
      }
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/game", { replace: true }),
        children: "Game"
      }
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => navigate("/chat", { replace: true }),
        children: "Chat"
      }
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: () => onLogoutClick(),
        children: "Logout"
      }
    },
  ];

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
            render={() => 
            <BasicMenu 
              mychildren={buttons}
              extAvatar={avatarSource}
            />            
            }

            fail={() => (
              <StyledNavButton showonxs variant={"text"} onClick={onLoginClick}>
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
