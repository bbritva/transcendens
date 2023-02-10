import { Button, ClickAwayListener, DialogTitle, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import { Box } from "@mui/system";
import { FC, useEffect, useRef, useState} from "react";
import { EventI } from "./ChannerSettingsDialog";
import { dialogProps } from "./ChooseDialogChildren";

const ChannelOwnerDialog: FC<dialogProps> = (props: dialogProps) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);
  return (
    <Box>
      <DialogTitle>'Channel' actions</DialogTitle>
      <Button
          ref={anchorRef}
          id="composition-button"
          aria-controls={open ? 'composition-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          Dashboard
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom-start' ? 'left top' : 'left bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="composition-menu"
                    aria-labelledby="composition-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>Logout</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      <Button onClick={() => {
        const event : EventI = {
          name : "addAdmin",
          data: {channelName : props.channel.name, targetUserName: props.element.name},
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Set as adm in 'channel'</Button>
      
      <Button onClick={() => {
        const event : EventI = {
          name : "banUser",
          data: {channelName : props.channel.name, targetUserName: props.element.name},
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Ban in 'channel'</Button>
      
      <Button onClick={() => {
        const event : EventI = {
          name : "muteUser",
          data: {channelName : props.channel.name, targetUserName: props.element.name},
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Mute in 'channel'</Button>
      
      <Button onClick={() => {
        const event : EventI = {
          name : "kickUser",
          data: {channelName : props.channel.name, targetUserName: props.element.name},
        }
        console.log(event);
        
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Kick from 'channel'</Button>
    </Box>
  );
}

export default ChannelOwnerDialog;