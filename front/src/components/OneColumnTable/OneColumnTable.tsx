import {
  Button,
  ClickAwayListener,
  Grid,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ReactElement,
  FC,
  useRef,
  CSSProperties,
  useState,
  ReactNode,
  cloneElement,
  Children,
  useEffect,
} from "react";
import DialogSelect from "src/components/DialogSelect/DialogSelect";
import { fromBackI } from "src/pages/Chat/ChatPage";
import { chatStylesI } from "src/pages/Chat/chatStyles";
import AdjustOutlinedIcon from "@mui/icons-material/AdjustOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { userI } from "src/store/userSlice";
import React from "react";

const anchorStyle = {
  overflowAnchor: "auto",
  height: "1px",
};

const OneColumnTable: FC<{
  taper: string;
  user: userI | null;
  loading: boolean;
  elements: fromBackI[];
  chatStyles: chatStylesI;
  selectedElement: {};
  setElement: Function;
  dialogChildren: ReactNode;
}> = ({
  taper,
  user,
  loading,
  elements,
  chatStyles,
  selectedElement,
  setElement,
  dialogChildren,
}): ReactElement => {
  const theme = useTheme();
  const tableRef = useRef(null);
  const [openDialog, setOpenDialog] = useState(false);
  const child = Children.only(dialogChildren);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

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
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
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
    <Grid
      container
      component={Paper}
      display="flex"
      justifyContent="center"
      sx={{
        height: "100%",
        ...chatStyles.borderStyle,
      }}
    >
      <Grid item xs={12} display="inherit" justifyContent={"inherit"}>
        <Typography
          variant="h6"
          maxHeight="3rem"
          sx={{
            ...chatStyles.textElipsis,
          }}
        >
          {taper}
        </Typography>
      </Grid>
      <Grid
        item
        ref={tableRef}
        display="flex"
        flexDirection={"column"}
        sx={{
          height: "90%",
          ...chatStyles.scrollStyle,
        }}
      >
        {loading
          ? "LOADING"
          : elements.map((data) => {
              return taper === "Users" && user?.name === data.name ? (
                <></>
              ) : (
                <Grid
                  item
                  ref={tableRef}
                  display="flex"
                  flexDirection={"row"}
                  sx={{
                    width: "100%",
                    ...chatStyles.scrollStyle,
                  }}
                >
                  <Button
                    id="composition-button"
                    aria-controls={open ? "composition-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-haspopup="true"
                    key={data.name}
                    variant={selectedElement == data ? "contained" : "text"}
                    startIcon={
                      data.connected && <AdjustOutlinedIcon fontSize="small" />
                    }
                    onClick={() => {
                      setElement(data);
                    }}
                    size="small"
                    sx={{
                      textAlign: "left",
                      maxHeight: "2rem",
                      maxWidth: "2rem",
                    }}
                  >
                    <Typography noWrap>{data.name}</Typography>
                  </Button>
                  <Button
                    ref={anchorRef}
                    id="composition-button"
                    aria-controls={open ? "composition-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-haspopup="true"
                    key={data.name}
                    variant={"text"}
                    onClick={() => {
                      setElement(data);
                      setOpen((prevOpen) => !prevOpen);
                    }}
                    sx={{
                      height: 20,
                      width: 20,
                      textAlign: "center",
                      maxHeight: "2rem",
                    }}
                  >
                    <MenuIcon fontSize="small" />
                  </Button>
                  <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    placement="right-start"
                    transition
                    disablePortal
                  >
                    {({ TransitionProps }) => (
                      <Grow
                        {...TransitionProps}
                        style={{
                          transformOrigin: "left-start",
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
                              <MenuItem onClick={handleClose}>
                                My account
                              </MenuItem>
                              <MenuItem onClick={handleClose}>Logout</MenuItem>
                            </MenuList>
                          </ClickAwayListener>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </Grid>
              );
            })}
        <div style={anchorStyle as CSSProperties} />
      </Grid>
      <DialogSelect
        options={selectedElement}
        open={openDialog}
        setOpen={setOpenDialog}
      >
        {React.isValidElement(child) ? (
          //@ts-ignore
          cloneElement(child, { setOpen: setOpenDialog })
        ) : (
          <></>
        )}
      </DialogSelect>
    </Grid>
  );
};

export default OneColumnTable;
