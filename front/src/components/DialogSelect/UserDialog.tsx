import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import { dialogProps } from "./ChooseDialogChildren";

const UserDialog: FC<dialogProps> = (props: dialogProps) => {
  return (
    <Box>
      <DialogTitle>'User' actions</DialogTitle>
      <Button onClick={() => {
        props.setDestination(['Users', props.element]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>
        Message
      </Button>
      <Button>Pong's invite</Button>
      <Button>Profile</Button>
      <Button onClick={() => {
        props.setDestination(['beep', props.element]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Block</Button>
    </Box>
  );
}

export default UserDialog;