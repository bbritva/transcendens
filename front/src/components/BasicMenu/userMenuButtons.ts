import { FC } from "react";
import {userFromBackI } from "src/pages/Chat/ChatPage";
import { EventI } from "src/components/DialogSelect/ChannerSettingsDialog";
import { StyledMenuItem } from "src/components/BasicMenu/StyledMenu";
import { NavigateFunction } from "react-router-dom";
import socket from "src/services/socket";

function userMenuButtons(
  setOpen: Function,
  setDestination: Function,
  element: userFromBackI,
  navigate: NavigateFunction
): any{
  function createUserEvent(eventName: string) {
    const event: EventI = {
      name: eventName,
      data: { targetUserName: element.name },
    };
    setDestination(["Users", event]);
    if (setOpen) setOpen(false);
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
  
  function createBanPersonallyEvent() {
    createUserEvent("banPersonally");
  }
  function createUnbanPersonallyEvent() {
    createUserEvent("unbanPersonally");
  }
  function navigateToProfile(id: string) {
    navigate("/account?user=" + id);
  }
  function inviteToGame(name: string) {
    socket.emit("inviteToGame", { recipient: name});
  }

  return (
    [
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: createPrivateMessageEvent,
          children: "Message",
        },
      },
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: createAddFriendEvent,
          children: "Add to friend",
        },
      },
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => navigateToProfile(element.id),
          children: "Profile", //event?
        },
      },
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => inviteToGame(element.name), //event?
          children: "Send invitation",
        },
      },
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: createRemoveFriendEvent,
          children: "Remove from friends",
        },
      },
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: createBanPersonallyEvent,
          children: "Ban user",
        },
      },
      
      {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: createUnbanPersonallyEvent,
          children: "Unban user",
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
