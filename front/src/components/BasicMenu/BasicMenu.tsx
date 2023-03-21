import * as React from "react";
import { StyledMenuButton } from "../NavButton/StyledNavButton";
import { Avatar, Box, Typography } from "@mui/material";
import MoreVert from "@mui/icons-material/MoreVert";
import { RootState } from "src/store/store";
import { useStore } from "react-redux";
import { StyledMenu } from "./StyledMenu";

interface basicMenuI {
  extAvatar?: string
  fullwidth?: boolean
  title?: string
  onClick?: Function
  mychildren: {
    component: React.FC,
    compProps: {
      onClick: Function
    }
  }[]
}

export default function BasicMenu({ extAvatar, title, mychildren, onClick, fullwidth }: basicMenuI) {
  const { getState } = useStore();

  const { user } = getState() as RootState;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (onClick) {
      onClick();
    }
    setContextMenu(
      contextMenu === null
        ? {
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  return (
    <>
      <StyledMenuButton
        showonxs={+true}
        fullWidth={fullwidth}
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <>
          <Typography variant="subtitle1" marginRight={'1rem'}
          sx={{
            alignContent: "left",
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical"
          }}>{title}</Typography>
          <Box marginLeft={'auto'} display="flex" alignItems="center">
            {extAvatar && <Avatar src={extAvatar} />}
            <MoreVert color="secondary" />
          </Box>
        </>
      </StyledMenuButton>
      <StyledMenu
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        id="basic-menu"
        open={contextMenu !== null}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {mychildren.map((element) => {
          const MButton = element.component;
          //@ts-ignore
          return (<MButton {...element.compProps} onClick={() => { element.compProps.onClick(); handleClose(); }} />
          );
        })}
      </StyledMenu>
    </>
  );
}
