import { Button, DialogTitle, TextField, Typography } from "@mui/material";
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
  data?: any;
}

const ChannelSettingsDialog: FC<dialogProps> = (props: dialogProps) => {
  const [value, setValue] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPassConnect, setShowPassConnect] = useState(false);
  const [showName, setShowName] = useState(false);
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="0px"
    >
      {!showName && (
        <Button
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            setShowName(true);
          }}
        >
          <Typography variant="subtitle1"> Change name</Typography>
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
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            const event: EventI = {
              name: "changeChannelName",
              data: { channelName: props.element.name, newName: value },
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
            setShowName(false);
          }}
        >
          <Typography variant="subtitle1"></Typography>Submit
        </Button>
      )}

      {!showPassConnect && (
        <Button
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            setShowPassConnect(true);
          }}
        >
          <Typography variant="subtitle1">
            Connect to {props.element.name}
          </Typography>
        </Button>
      )}
      {showPassConnect && (
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="enter password"
          type="text"
          variant="standard"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
        />
      )}
      {showPassConnect && (
        <Button
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            const event: EventI = {
              name: "connectToChannel",
              data: { name: props.element.name, password: value },
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
            setShowPassConnect(false);
          }}
        >
          <Typography variant="subtitle1">Submit</Typography>
        </Button>
      )}

      <Button
        fullWidth
        sx={{
          justifyContent: "flex-start",
        }}
        onClick={() => {
          const event: EventI = {
            name: "leaveChannel",
            data: { name: props.element.name },
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        <Typography variant="subtitle1">
          Leave {props.element.name}
        </Typography>
      </Button>
      {props.channel.isPrivate && (
        <Button
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            const event: EventI = {
              name: "setPrivacy",
              data: { channelName: props.element.name, isPrivate: false },
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
          }}
        >
          <Typography variant="subtitle1"> Make { props.element.name } public</Typography>
        </Button>
      )}
      {!props.channel.isPrivate && (
        <Button
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            const event: EventI = {
              name: "setPrivacy",
              data: { channelName: props.element.name, isPrivate: true },
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
          }}
        >
          <Typography variant="subtitle1"> Make {props.element.name} private</Typography>
        </Button>
      )}
      {!showPass && (
        <Button
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            setShowPass(true);
          }}
        >
          <Typography variant="subtitle1">
            Change password for {props.element.name}
          </Typography>
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
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            const event: EventI = {
              name: "setPassword",
              data: { channelName: props.element.name, password: value },
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
            setShowPass(false);
          }}
        >
          <Typography variant="subtitle1">Submit</Typography>
        </Button>
      )}
    </Box>
  );
};

export default ChannelSettingsDialog;
