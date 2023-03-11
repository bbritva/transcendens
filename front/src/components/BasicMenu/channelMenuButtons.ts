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
    setOpen(false);
  }
  function disconnectFromChanel() {
    const event: EventI = {
      name: "setPrivacy",
      data: { channelName: element.name, isPrivate: false },
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
  ];
}

export default channelMenuButtons;
