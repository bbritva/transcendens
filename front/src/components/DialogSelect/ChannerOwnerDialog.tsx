import {
  Button,
  DialogTitle,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import { EventI } from "./ChannerSettingsDialog";
import { dialogProps } from "./ChooseDialogChildren";

const ChannelOwnerDialog: FC<dialogProps> = (props: dialogProps) => {
  const theme = useTheme();
  return (
    <Box
      // component={Paper}
      sx={{ backgroundColor: theme.palette.secondary.main }}
      display="flex"
      flexDirection="column"
      alignItems="center"
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
        <Typography variant="subtitle1">Set as adm in 'channel'</Typography>
      </Button>

      <Button
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
            },
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        <Typography variant="subtitle1">Ban in 'channel'</Typography>
      </Button>

      <Button
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
            },
          };
          props.setDestination(["Channels", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        <Typography variant="subtitle1">Mute in 'channel'</Typography>
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
        <Typography variant="subtitle1">Kick from 'channel'</Typography>
      </Button>
    </Box>
  );
};

export default ChannelOwnerDialog;
