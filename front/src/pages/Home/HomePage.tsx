import {Box, Button, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Stack, Typography} from '@mui/material'
import { useEffect, useRef, useState } from 'react';
import { EventI } from 'src/components/DialogSelect/ChannerSettingsDialog';
import socket from 'src/services/socket';

function HomePage() {
  const [open, setOpen] = useState(false);
  const [event, setEvent] = useState<EventI>({} as EventI);

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


  useEffect(() => {
    socket.emit(event.name, event.data);
  }, [event]);

  return (
    <Box sx={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        verticalAlign: 'center'
    }}>
        <Typography variant="h4" color={'lightsalmon'}>
          Ultimate 42
        </Typography>
        <Typography variant="h2" color={'lightgoldenrodyellow'}>
          Most Popular
        </Typography>
        <Stack direction="row" spacing={2}>
      <div>
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
                    <MenuItem onClick={handleClose}>GetNameSuggestions</MenuItem>
                    <MenuItem onClick={() => {
                      const event : EventI = {
                        name : "getLadder",
                      }
                      setEvent(event);
                      setOpen(false);
                    }
                    }>Get Ladder</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </Stack>
    </Box>
    
  );
}

export default HomePage;