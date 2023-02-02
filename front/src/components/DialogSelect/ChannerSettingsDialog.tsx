import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC} from "react";
import { dialogProps } from "./ChooseDialogChildren";

export interface EventI {
  name: string;
  params: string[]
}

const ChannelSettingsDialog: FC<dialogProps> = (props: dialogProps) => {
  return (
    <Box>
      <DialogTitle>'Channel' settings</DialogTitle>

      <Button onClick={() => {
        const event : EventI = {
          name : "changeChannelName",
          params : [props.element.name, "newChannelName"]
          // need field to enter new channel name
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Change name 'channel'</Button>

      <Button onClick={() => {
        const event : EventI = {
          name : "connectToChannel",
          params : [props.element.name]
        }
        // need possibility to enter a password
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Connect to 'channel'</Button>

      <Button  onClick={() => {
        const event : EventI = {
          name : "leaveChannel",
          params : [props.element.name]
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Leave 'channel'</Button>

      <Button onClick={() => {
        const event : EventI = {
          name : "setPrivacy",
          params : [props.element.name, "true"]
          // need possibility to set privacy to false
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Set 'channel' private</Button>

      <Button onClick={() => {
        const event : EventI = {
          name : "setPassword",
          params : [props.element.name, "password"]
          // need possibility to set password
        }
        props.setDestination(['Channels', event]);
        if (props?.setOpen)
          props.setOpen(false);
      }}>Change pass 'channel'</Button>
    </Box>
  );
}

export default ChannelSettingsDialog;