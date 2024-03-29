import { FC } from "react";
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import { SelectChangeEvent } from "@mui/material/Select";
import { IconButton, Box, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface props {
  options?: {};
  open: boolean;
  setOpen: Function;
  children: React.ReactNode;
  myRef?: React.ForwardedRef<HTMLDivElement>;
}

const DialogSelect: FC<props> = ({
  options,
  open,
  setOpen,
  children,
  myRef,
}) => {
  const theme = useTheme();

  const handleClose = (
    event: React.SyntheticEvent<unknown>,
    reason?: string
  ) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
    else if (options)
      setOpen(false);
  };
  return (
    <Dialog
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.secondary.main,
        },
      }}
      ref={myRef || null}
      disableEscapeKeyDown={false}
      open={open}
      onClose={handleClose}
    >
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          zIndex: 5,
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <Box
        margin={"1rem"}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"flex-start"}
      >
        {children}
      </Box>
    </Dialog>
  );
};

export default DialogSelect;
