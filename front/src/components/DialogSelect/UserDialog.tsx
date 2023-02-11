import { Button, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";
import { channelFromBackI, userFromBackI } from "src/pages/Chat/ChatPage";
import { EventI } from "./ChannerSettingsDialog";
import { dialogProps } from "./ChooseDialogChildren";

const userName = sessionStorage.getItem("username");
const UserDialog: FC<dialogProps> = (props: dialogProps) => {
  function createUserEvent(eventName: string) {
    const event: EventI = {
      name: eventName,
      data: { targetUserName: props.element.name },
    };
    props.setDestination(["Users", event]);
    if (props?.setOpen) props.setOpen(false);
  }

  function createGetUserStatEvent() {
    createUserEvent("getUserStats");
  }

  function createAddFriendEvent() {
    createUserEvent("addFriend");
  }
  function createRemoveFriendEvent() {
    createUserEvent("removeFriend");
  }
  function createGetFriendsEvent() {
    createUserEvent("getFriends");
  }
  function createBanPersonallyEvent() {
    createUserEvent("banPersonally");
  }
  function createUnbanPersonallyEvent() {
    createUserEvent("unbanPersonally");
  }
  function createGetPersonallyBannedEvent() {
    createUserEvent("getPersonallyBanned");
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
      <Button onClick={createGetUserStatEvent}>Show user stats</Button>
      <Button onClick={createAddFriendEvent}>Add to Friends</Button>
      <Button onClick={createRemoveFriendEvent}>Remove from Friends</Button>
      <Button onClick={createGetFriendsEvent}>Get friends</Button>
      <Button onClick={createBanPersonallyEvent}>Ban User</Button>
      <Button onClick={createUnbanPersonallyEvent}>Unban User</Button>
      <Button onClick={createGetPersonallyBannedEvent}>
        Get personnaly banned
      </Button>
    </Box>
  );
};

export default UserDialog;
