import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import { channelFromBackI, userFromBackI } from "src/pages/Chat/ChatPage";
import { EventI } from "./ChannerSettingsDialog";
import { dialogProps } from "./ChooseDialogChildren";

const userName = sessionStorage.getItem("username");
const UserDialog: FC<dialogProps> = (props: dialogProps) => {
  function setStatEvent() {
    const event: EventI = {
      name: "getUserStats",
      data: { targetUserName: props.element.name },
    };
    props.setDestination(["Users", event]);
    if (props?.setOpen) props.setOpen(false);
  }
  return (
    <Box>
      <DialogTitle>'User' actions</DialogTitle>
      <Button
        onClick={() => {
          const privateChannel = {} as channelFromBackI;
          privateChannel.name = `${props.element.name} ${userName} pm`;
          privateChannel.users = [
            { name: props.element.name } as userFromBackI,
            { name: userName } as userFromBackI,
          ];
          const event: EventI = {
            name: "privateMessage",
            data: privateChannel,
          };
          props.setDestination(["Users", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Message
      </Button>
      <Button>Pong's invite</Button>
      <Button>Profile</Button>
      <Button onClick={setStatEvent}>Show user stats</Button>
      <Button
        onClick={() => {
          const event: EventI = {
            name: "addFriend",
            data: { targetUserName: props.element.name },
          };
          props.setDestination(["Users", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Add to Friends
      </Button>
      <Button
        onClick={() => {
          const event: EventI = {
            name: "removeFriend",
            data: { targetUserName: props.element.name },
          };
          props.setDestination(["Users", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Remove from Friends
      </Button>
      <Button
        onClick={() => {
          const event: EventI = {
            name: "getFriends",
            data: {},
          };
          props.setDestination(["Users", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Get friends
      </Button>
      <Button
        onClick={() => {
          const event: EventI = {
            name: "banPersonally",
            data: { targetUserName: props.element.name },
          };
          props.setDestination(["Users", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Ban User
      </Button>
      <Button
        onClick={() => {
          const event: EventI = {
            name: "unbanPersonally",
            data: { targetUserName: props.element.name },
          };
          props.setDestination(["Users", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Unban User
      </Button>
      <Button
        onClick={() => {
          const event: EventI = {
            name: "getPersonallyBanned",
            data: {},
          };
          props.setDestination(["Users", event]);
          if (props?.setOpen) props.setOpen(false);
        }}
      >
        Get personnaly banned
      </Button>
    </Box>
  );
};

export default UserDialog;
