import { Padding } from "@mui/icons-material";
import { Button, TextField, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { FC, useState } from "react";
import { EventI } from "./ChannerSettingsDialog";
import { dialogProps } from "./ChooseDialogChildren";

const ChannelOwnerDialog: FC<dialogProps> = (props: dialogProps) => {
  const theme = useTheme();
  const [punishTime, setPunishTime] = useState("");
  const [punishAvailable, setPunishAvailable] = useState(false);

  function onChange(
    this: any,
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void {
    setPunishTime(event.currentTarget.value);
    const regex = /^[0-9]{1,3}$/;
      if (regex.test(event.currentTarget.value)) {
        setPunishAvailable(true);
      } else {
        setPunishAvailable(false);
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding="0px"
    >
      <Button
        fullWidth
        sx={{
          justifyContent: "flex-start",
        }}
        onClick={() => {
          const event: EventI = {
            name: "addAdmin",
            data: {
              channelName: props.channel.name,
              targetUserName: props.element.name,
            },
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        <Typography variant="subtitle1">
          Set as adm in {props.channel.name}
        </Typography>
      </Button>
      <TextField
        error={!punishAvailable}
        label={"Punish time (min)"}
        onChange={onChange}
        margin="dense"
      />

      <Box display="flex" flexDirection="row" alignItems="center" padding="0px">
        <Button
          disabled={!punishAvailable}
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            const event: EventI = {
              name: "banUser",
              data: {
                channelName: props.channel.name,
                targetUserName: props.element.name,
                punishTime: punishTime
              },
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
          }}
        >
          <Typography variant="subtitle1">Ban</Typography>
        </Button>

        <Button
          disabled={!punishAvailable}
          fullWidth
          sx={{
            justifyContent: "flex-start",
          }}
          onClick={() => {
            const event: EventI = {
              name: "muteUser",
              data: {
                channelName: props.channel.name,
                targetUserName: props.element.name,
                punishTime: punishTime,
              },
            };
            props.setDestination(["Channels", event]);
            if (props?.setOpen) props.setOpen(false);
          }}
        >
          <Typography variant="subtitle1">Mute</Typography>
        </Button>
      </Box>

      <Button
        fullWidth
        sx={{
          justifyContent: "flex-start",
        }}
        onClick={() => {
          const event: EventI = {
            name: "unmuteUser",
            data: {
              channelName: props.channel.name,
              targetUserName: props.element.name,
            },
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        <Typography variant="subtitle1">
          Unmute in {props.channel.name}
        </Typography>
      </Button>

      <Button
        fullWidth
        sx={{
          justifyContent: "flex-start",
        }}
        onClick={() => {
          const event: EventI = {
            name: "kickUser",
            data: {
              channelName: props.channel.name,
              targetUserName: props.element.name,
            },
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        <Typography variant="subtitle1">
          Kick from {props.channel.name}
        </Typography>
      </Button>
    </Box>
  );
};

export default ChannelOwnerDialog;
