import { FC } from "react";
import { EventI } from "src/components/DialogSelect/ChannerSettingsDialog";
import { StyledMenuItem } from "src/components/BasicMenu/StyledMenu";
import { NavigateFunction } from "react-router-dom";
import socket from "src/services/socket";
import { GameStateDataI } from "src/pages/Game/components/game/game";

function GameSpectateButtons(
  setEvent: Function,
  element: GameStateDataI
): any {
  function createSpectateEvent() {
    setEvent(["spectateGame", { gameName: element.gameName }]);
  }

  return [
    {
      component: StyledMenuItem as FC,
      compProps: {
        onClick: createSpectateEvent,
        children: "Watch game",
        key: "Watch game",
      },
    },
  ];
}

export default GameSpectateButtons;
