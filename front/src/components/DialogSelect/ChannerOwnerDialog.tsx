import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC} from "react";
import { EventI } from "./ChannerSettingsDialog";
import { dialogProps } from "./ChooseDialogChildren";

const ChannelOwnerDialog: FC<dialogProps> = (props: dialogProps) => {
  return (
    <Box>
      <DialogTitle>'Channel' actions</DialogTitle>

      <Button onClick={() => {
        const event : EventI = {
          name : "addAdmin",
          params : [props.channel.name, props.element.name]
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Set as adm in 'channel'</Button>
      
      <Button onClick={() => {
        const event : EventI = {
          name : "banUser",
          params : [props.channel.name, props.element.name]
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Ban in 'channel'</Button>
      
      <Button>Mute in 'channel'</Button>
      
      <Button>Kick from 'channel'</Button>
    </Box>
  );
}

export default ChannelOwnerDialog;