import { Dispatch } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { notifyI } from "src/App";
import {
  channelFromBackI,
  fromBackI,
  newMessageI,
  userFromBackI,
  userInChannelMovementI,
} from "src/pages/Chat/ChatPage";
import { GameStateDataI } from "src/pages/Game/components/game/game";
import { logout } from "src/store/authActions";
import { setBanned, setUsers, UserInfoPublic } from "src/store/chatSlice";

const URL = process.env.REACT_APP_AUTH_URL || "";
const socket = io(URL, { autoConnect: false });

export function initSocket(
  navigate: Function,
  setGameData: Function,
  setChannels: Function,
  setNotify: Function,
  dispatch: Dispatch
) {
  socket.on("channels", (channels: channelFromBackI[]) => {
    setChannels(channels);
  });

  socket.on("userConnected", (channelName: string, user: userFromBackI) => {
    setChannels((prev: channelFromBackI[]) => {
      const channelInd = prev.findIndex((el) => el.name === channelName);
      if (channelInd !== -1) {
        const res = [...prev];
        const userInd = res[channelInd].users.findIndex(
          (el) => el.name === user.name
        );
        if (userInd === -1) {
          user.connected = true;
          res[channelInd].users.push(user);
        } else {
          res[channelInd].users[userInd].connected = true;
        }
        return res;
      }
      return prev;
    });
  });

  socket.on("channelInfo", (channel: channelFromBackI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === channel.name);
      const res = [...prev];
      channel.connected = true;
      if (ind !== -1) res[ind] = channel;
      else res.push(channel);
      return res;
    });
  });

  socket.on("leftChannel", (channelName: string) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === channelName);
      const res = [...prev];
      if (ind !== -1) {
        if (channelName.endsWith("pm"))
          return res.filter((channel) => channel.name != channelName);
        res[ind].connected = false;
        res[ind].messages = [];
        res[ind].users = [];
      }
      return res;
    });
  });

  socket.on("userLeft", (data: userInChannelMovementI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === data.channelName);
      const res = [...prev];
      if (ind !== -1) {
        res[ind].users = res[ind].users.filter(
          (user) => user.name != data.userName
        );
      }
      return res;
    });
  });

  socket.on("userDisconnected", (data: userInChannelMovementI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === data.channelName);
      const res = [...prev];
      if (ind !== -1) {
        for (const user of res[ind].users) {
          if (user.name == data.userName) {
            user.connected = false;
          }
        }
      }
      return res;
    });
  });

  socket.on("newMessage", (message: newMessageI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === message.channelName);
      const res = [...prev];
      if (ind !== -1) {
        res[ind].messages.push(message);
      }
      return res;
    });
  });

  socket.on("connectToGame", (game) => {
    if (socket.connected) {
      setGameData(game);
      navigate("/game", { replace: true });
    }
  });

  socket.on("connect", () => {});

  socket.on("disconnect", () => {});

  socket.on("userStat", (data: fromBackI) => {
    console.log("userStat", data);
  });

  socket.on("ladder", (data: fromBackI[]) => {
    console.log("ladder", data);
  });

  socket.on("newFriend", (data: fromBackI) => {
    setNotify({
      message: `${data.name} added to your friends`,
      severity: "success",
    });
  });

  socket.on("userMuted", (data: fromBackI) => {
    setNotify({ message: `you muted ${data.name}`, severity: "success" });
  });

  socket.on("userBanned", (data: fromBackI) => {
    setNotify({
      message: `you banned ${data.name}`,
      severity: "success",
    });
  });

  socket.on("userUnmuted", (data: fromBackI) => {
    setNotify({ message: `you unmuted ${data.name}`, severity: "success" });
  });

  socket.on("userUnbanned", (data: fromBackI) => {
    setNotify({ message: `you unbanned ${data.name}`, severity: "success" });
  });

  socket.on("userKicked", (data: fromBackI) => {
    setNotify({ message: `you kicked ${data.name}`, severity: "success" });
  });

  socket.on("exFriend", (data: fromBackI) => {
    setNotify({
      message: `${data.name} removed from your friends`,
      severity: "success",
    });
  });

  socket.on("friendList", (data: UserInfoPublic[]) => {
    dispatch(setUsers(data));
    console.log("friendList", data);
  });

  socket.on("newPersonnalyBanned", (data: UserInfoPublic) => {
    dispatch(setBanned([data]));
    setNotify({ message: `you banned ${data.name}`, severity: "success" });
  });

  socket.on("exPersonnalyBanned", (data: fromBackI) => {
    setNotify({ message: `you unbanned ${data.name}`, severity: "success" });
  });

  socket.on("personallyBannedList", (data: UserInfoPublic[]) => {
    dispatch(setBanned(data));
    console.log("personallyBannedList", data);
  });

  socket.on("nameAvailable", (data: fromBackI) => {
    console.log("nameAvailable", data);
  });

  socket.on("nameTaken", (data: fromBackI) => {
    console.log("nameTaken", data);
  });

  socket.on("nameSuggestions", (data: string[]) => {
    console.log("nameSuggestions", data);
  });

  socket.on("activeGames", (data: GameStateDataI[]) => {
    console.log("activeGames", data);
  });

  socket.on("notAllowed", (data: any) => {
    setNotify({ message: data.cause, severity: "warning" });
  });

  socket.on("declineInvite", (data: any) => {
    setNotify({ message: data.cause, severity: "warning" });
  });

  socket.on("executionError", (data: any) => {
    console.log("executionError", data);
  });

  socket.on("connectionError", (data: any) => {
    dispatch(logout());
    window.location.reload();
    setNotifyMessage(data.cause)
  });

  setTimeout(() => {
    socket.emit("getFriends");
    socket.emit("getPersonallyBanned");
  }, 1000);
}

export default socket;
