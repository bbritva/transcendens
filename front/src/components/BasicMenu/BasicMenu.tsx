import * as React from "react";
import { StyledNavButton } from "../NavButton/StyledNavButton";
import { Avatar } from "@mui/material";
import MoreVert from "@mui/icons-material/MoreVert";
import fakeAvatar from "src/assets/logo192.png";
import { RootState } from "src/store/store";
import { useStore } from "react-redux";
import { useNavigate } from "react-router-dom";
import { StyledMenu, StyledMenuItem } from "./StyledMenu";

interface basicMenuI {
  onLogout: Function;
}

export default function BasicMenu({ onLogout }: basicMenuI) {
  const { getState } = useStore();
  const navigate = useNavigate();
  const { user } = getState() as RootState;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <StyledNavButton
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <Avatar src={user.user?.avatar || user.user?.image || fakeAvatar} />
        <MoreVert color="secondary" />
      </StyledNavButton>
      <StyledMenu 
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
       
        <StyledMenuItem
          onClick={() => {
            navigate("/account", { replace: true });
            handleClose();
          }}
        >
          {user.user?.name || "Profile"}
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => {
            onLogout();
            handleClose();
          }}
        >
          Logout
        </StyledMenuItem>
      </StyledMenu>
    </>
  );
}
