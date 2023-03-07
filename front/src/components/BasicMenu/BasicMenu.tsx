import * as React from "react";
import { StyledMenuButton } from "../NavButton/StyledNavButton";
import { Avatar, Typography } from "@mui/material";
import MoreVert from "@mui/icons-material/MoreVert";
import fakeAvatar from "src/assets/logo192.png";
import { RootState } from "src/store/store";
import { useStore } from "react-redux";
import { StyledMenu } from "./StyledMenu";

interface basicMenuI {
  onLogout: Function;
  title?: string
  mychildren: {
    component: React.FC,
    compProps: {
      onClick: Function
    }
  }[]
}

export default function BasicMenu({ onLogout, title, mychildren}: basicMenuI) {
  const { getState } = useStore();

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
      <StyledMenuButton
        showonxs
        fullWidth
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        {
          title
          ? <Typography variant="subtitle1">{title}</Typography>
          : <>
              <Avatar src={user.user?.avatar || user.user?.image || fakeAvatar} />
              <MoreVert color="secondary" />
            </>
        }
      </StyledMenuButton>
      <StyledMenu 
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {mychildren.map((element) => {
          const MButton = element.component;
          //@ts-ignore
          return (<MButton {...element.compProps}  onClick={() => {element.compProps.onClick();handleClose();}}/>
          );
        })}
      </StyledMenu>
    </>
  );
}
