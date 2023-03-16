import { FC } from "react";
import { userFromBackI } from "src/pages/Chat/ChatPage";
import { EventI } from "../DialogSelect/ChannerSettingsDialog";
import { StyledMenuItem } from "./StyledMenu";

function channelMenuButtons(
  setOpen: Function,
  setDestination: Function,
  element: userFromBackI
) {
  function joinChannel() {
    const event: EventI = {
      name: "joinChannel",
      data: { name: element.name },
    };
    setDestination(["Channels", event]);
  }
  function leaveChannel() {
    const event: EventI = {
      name: "leaveChannel",
      data: {name : element.name},
    };
    setDestination(["Channels", event]);
  }

  return [
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: joinChannel,
        children: "Join",
      },
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: leaveChannel,
        children: "Leave",
      },
    },
    {
        component: StyledMenuItem as FC,
        compProps: {
          onClick: () => {setOpen(true)},
          children: "Settings",
        },
      },
  ];
}

export default channelMenuButtons;
