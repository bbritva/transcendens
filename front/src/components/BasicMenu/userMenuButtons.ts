
import { FC } from "react";
import {userFromBackI } from "src/pages/Chat/ChatPage";
import { EventI } from "../DialogSelect/ChannerSettingsDialog";
import { StyledMenuItem } from "./StyledMenu";

function userMenuButtons(
  setOpen: Function,
  setDestination: Function,
  element: userFromBackI
){
  function createUserEvent(eventName: string) {
    const event: EventI = {
      name: eventName,
      data: { targetUserName: element.name },
    };
    setDestination(["Users", event]);
    if (setOpen) setOpen(false);
  }

  function createGetUserStatEvent() {
    createUserEvent("getUserStats");
  }

  function createPrivateMessageEvent() {
    createUserEvent("privateMessage");
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
    [
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: createPrivateMessageEvent,
          children: "PM",
        },
      },
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => {setOpen(true)},
          children: "Channel settings",
        },
      },
    ]
  );
};

export default userMenuButtons;
