import { FC } from "react";
import { userFromBackI } from "src/pages/Chat/ChatPage";
import { EventI } from "../DialogSelect/ChannerSettingsDialog";
import { StyledMenuItem } from "./StyledMenu";

function channelMenuButtons(
  setOpen: Function,
  setDestination: Function,
  element: userFromBackI
) {
  function connectToChannel() {
    const event: EventI = {
      name: "connectToChannel",
      data: { name: element.name },
    };
    setDestination(["Channels", event]);
  }
  function disconnectFromChanel() {
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
        onClick: connectToChannel,
        children: "Connect",
      },
    },
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: disconnectFromChanel,
        children: "Disconnect",
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
