import { Dispatch } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { notifyI } from "src/App";
import { SetPrivacyI } from "src/components/DialogSelect/ChannerSettingsDialog";
import {
  channelFromBackI,
  fromBackI,
  newMessageI,
  userFromBackI,
  userInChannelMovementI,
  NameSuggestionInfoI,
  UserStatusI
} from "src/pages/Chat/ChatPage";
import { GameStateDataI } from "src/pages/Game/components/game/game";
import { logout } from "src/store/authActions";
import {
  deleteBanned,
  deleteFriend,
  setBanned,
  setFriends,
  setFriendStatus,
  UserInfoPublic,
} from "src/store/chatSlice";

const URL = process.env.REACT_APP_AUTH_URL || "";
const socket = io(URL, { autoConnect: false });

export function initSocket(
  navigate: Function,
  setGameData: Function,
  setChannels: Function,
  setNotify: Function,
  dispatch: Dispatch
) {
  socket.on("connect_error", (err) => console.log(err));
  socket.on("connect_failed", (err) => console.log(err));
  socket.on("disconnect", (err) => console.log(err));

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
          (user) => user.name != data.targetUserName
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
          if (user.name == data.targetUserName) {
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
      navigate("/game", { replace: false });
    }
  });

  socket.on("userStatus", (data: UserStatusI) => {
    setNotify({
      message: `${data.name} changed status to ${data.status}`,
      severity: "success",
    });
    dispatch(setFriendStatus(data));
  });

  socket.on("connect", () => {});

  socket.on("disconnect", () => {});

  socket.on("userStat", (data: fromBackI) => {
  });

  socket.on("ladder", (data: fromBackI[]) => {
  });

  socket.on("newFriend", (data: UserInfoPublic) => {
    dispatch(setFriends([data]));
    setNotify({
      message: `${data.name} added to your friends`,
      severity: "success",
    });
  });

  socket.on("newAdmin", (data: userInChannelMovementI) => {
    setNotify({
      message: `${data.targetUserName} is an administrator in ${data.channelName} now`,
      severity: "success",
    });
  });

  socket.on("userMuted", (data: userInChannelMovementI) => {
    setNotify({ message: `you muted ${data.targetUserName}`, severity: "success" });
  });

  socket.on("userBanned", (data: userInChannelMovementI) => {
    setNotify({
      message: `you banned ${data.targetUserName}`,
      severity: "success",
    });
  });

  socket.on("youBanned", (data: userInChannelMovementI) => {
    setNotify({
      message: `you're banned in ${data.channelName}`,
      severity: "warning",
    });
  });

  socket.on("userUnmuted", (data: userInChannelMovementI) => {
    setNotify({ message: `you unmuted ${data.targetUserName}`, severity: "success" });
  });

  socket.on("userUnbanned", (data: userInChannelMovementI) => {
    setNotify({ message: `you unbanned ${data.targetUserName}`, severity: "success" });
  });

  socket.on("youUnbanned", (data: userInChannelMovementI) => {
    setNotify({
      message: `you're unbanned in ${data.channelName}`,
      severity: "success",
    });
  });

  socket.on("userKicked", (data: userInChannelMovementI) => {
    setNotify({ message: `you kicked ${data.targetUserName}`, severity: "success" });
  });

  socket.on("newChannelName", (data: { channelName: string, newName: string }) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === data.channelName);
      const res = [...prev];
      if (ind !== -1) {
        res[ind].name = data.newName;
      }
      return res;
    });
    setNotify({ message: `channel ${data.channelName} became ${data.newName}`, severity: "success" });
  });

  socket.on("privacySet", (data: SetPrivacyI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === data.channelName);
      const res = [...prev];
      if (ind !== -1) {
        res[ind].isPrivate = data.isPrivate;
      }
      return res;
    });
    setNotify({ message: `channel ${data.channelName} became ${data.isPrivate ? "private" : "public"}`, severity: "success" });
  });

  socket.on("passwordSet", (data: {channelName: string, hasPassword: boolean}) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === data.channelName);
      const res = [...prev];
      if (ind !== -1) {
        res[ind].hasPasswrod = data.hasPassword;
      }
      return res;
    });
    setNotify({ message: `channel ${data.channelName} is ${data.hasPassword ? "": "not "}password protected now`, severity: "success" });
  });

  

  socket.on("exFriend", (data: UserInfoPublic) => {
    dispatch(deleteFriend(data));
    setNotify({
      message: `${data.name} removed from your friends`,
      severity: "success",
    });
  });

  socket.on("friendList", (data: UserInfoPublic[]) => {
    dispatch(setFriends(data));
  });

  socket.on("newPersonnalyBanned", (data: UserInfoPublic) => {
    dispatch(setBanned([data]));
    setNotify({ message: `you banned ${data.name}`, severity: "success" });
  });

  socket.on("exPersonnalyBanned", (data: UserInfoPublic) => {
    dispatch(deleteBanned(data));
    setNotify({ message: `you unbanned ${data.name}`, severity: "success" });
  });

  socket.on("personallyBannedList", (data: UserInfoPublic[]) => {
    dispatch(setBanned(data));
  });

  socket.on("nameAvailable", (data: fromBackI) => {
  });

  socket.on("nameTaken", (data: fromBackI) => {
  });

  socket.on("nameSuggestions", (data: NameSuggestionInfoI[]) => {
  });

  socket.on("notAllowed", (data: any) => {
    setNotify({ message: data.cause, severity: "warning" });
  });

  socket.on("declineInvite", (data: any) => {
    setNotify({ message: data.cause, severity: "warning" });
  });

  socket.on("executionError", (data: any) => {
  });

  socket.on("connectionError", (data: any) => {
    dispatch(logout());
    window.location.reload();
    setNotify({ message: data.cause, severity: "warning" });
  });

  setTimeout(() => {
    socket.emit("getFriends");
    socket.emit("getPersonallyBanned");
  }, 1000);
}

export default socket;
