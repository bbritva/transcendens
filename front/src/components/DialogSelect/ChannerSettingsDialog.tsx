import { Button, DialogTitle, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { FC, useState } from "react";
import { dialogProps } from "./ChooseDialogChildren";

export interface UserManageI {
  channelName: string;
  targetUserName: string;
}

export interface ChangeChannelNameI {
  channelName: string;
  newName: string;
}

export interface SetPrivacyI {
  channelName: string;
  isPrivate: boolean;
}

export interface SetPasswordI {
  channelName: string;
  password: string;
}

export interface EventI {
  name: string;
  data: any;
}

const ChannelSettingsDialog: FC<dialogProps> = (props: dialogProps) => {
  const [value, setValue] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showName, setShowName] = useState(false);
  return (
    <Box>
      <DialogTitle>'Channel' settings</DialogTitle>
      {!showName && (
        <Button
          onClick={() => {
            setShowName(true);
          }}
        >
          Change name 'channel'
        </Button>
      )}
      {showName && (
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="new name"
          type="text"
          variant="standard"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
      )}
      {showName && (
        <Button
          onClick={() => {
            console.log(props.element);
            const event: EventI = {
              name: "changeChannelName",
              data: {channelName : props.element.name, newName: value},
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
            setShowName(false);
          }}
        >
          Submit
        </Button>
      )}

      <Button
        onClick={() => {
          const event: EventI = {
            name: "connectToChannel",
            data: {channelName : props.element.name},
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Connect to 'channel'
      </Button>
      <Button
        onClick={() => {
          const event: EventI = {
            name: "leaveChannel",
            data: {channelName : props.element.name},
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Leave 'channel'
      </Button>
      {props.channel.isPrivate && (
        <Button
          onClick={() => {
            const event: EventI = {
              name: "setPrivacy",
              data: {channelName : props.element.name, isPrivate: false},
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
          }}
        >
          Make 'channel' public
        </Button>
      )}
      {!props.channel.isPrivate && (
        <Button
          onClick={() => {
            const event: EventI = {
              name: "setPrivacy",
              data: {channelName : props.element.name, isPrivate: true},
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
          }}
        >
          Make 'channel' private
        </Button>
      )}
      {!showPass && (
        <Button
          onClick={() => {
            setShowPass(true);
          }}
        >
          Change password 'channel'
        </Button>
      )}
      {showPass && (
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="new password"
          type="text"
          variant="standard"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
      )}
      {showPass && (
        <Button
          onClick={() => {
            console.log(props.element);
            const event: EventI = {
              name: "setPassword",
              data: {channelName : props.element.name, password: value},
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
            setShowPass(false);
          }}
        >
          Submit
        </Button>
      )}
    </Box>
  );
};

export default ChannelSettingsDialog;
