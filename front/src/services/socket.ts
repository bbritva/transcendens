import { Dispatch } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { channelFromBackI, fromBackI, newMessageI, userFromBackI } from 'src/pages/Chat/ChatPage';
import { GameStateDataI } from 'src/pages/Game/components/game/game';
import { logout } from 'src/store/authActions';
import { setBanned, setUsers, UserInfoPublic } from 'src/store/chatSlice';

const URL = process.env.REACT_APP_AUTH_URL || "";
const socket = io(URL, { autoConnect: false });

export function initSocket(
  navigate: Function,
  setGameData: Function,
  // gameData: InitialGameDataI | null,
  setChannels: Function,
  setNotifyMessage: Function,
  dispatch: Dispatch
) {
  socket.on("connectError", (err) => {
    if (err.message === "invalid username") {
      dispatch(logout());
    }
  });

  socket.on("channels", (channels: channelFromBackI[]) => {
    setChannels(channels);
  });

  socket.on("userConnected", (channelName: string, userName: string) => {
    setChannels((prev: channelFromBackI[]) => {
      const channelInd = prev.findIndex((el) => el.name === channelName);
      if (channelInd !== -1) {
        const res = [...prev];
        const userInd = res[channelInd].users.findIndex(
          (el) => el.name === userName
        );
        if (userInd === -1) return prev;
        res[channelInd].users[userInd].connected = true;
        return res;
      }
      return prev;
    });
  });

  socket.on("joinedToChannel", (channel: channelFromBackI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === channel.name);
      const res = [...prev];
      channel.connected = true;
      if (ind !== -1) res[ind] = channel;
      else res.push(channel);
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
    console.log("userStat", data);
  });

  socket.on("newFriend", (data: fromBackI) => {
    console.log("newFriend", data);
  });


  socket.on("userMuted", (data: fromBackI) => {
    console.log("userMuted", data);
  });

  socket.on("userBanned", (data: fromBackI) => {
    console.log("userBanned", data);
  });

  socket.on("userUnmuted", (data: fromBackI) => {
    console.log("userUnmuted", data);
  });


  socket.on("userUnbanned", (data: fromBackI) => {
    console.log("userUnbanned", data);
  });


  socket.on("userKicked", (data: fromBackI) => {
    console.log("userKicked", data);
  });

  socket.on("exFriend", (data: fromBackI) => {
    console.log("exFriend", data);
  });

  socket.on("friendList",(data: UserInfoPublic[]) => {
    dispatch(setUsers(data));
    console.log("friendList", data);
  })

  socket.on("newPersonnalyBanned",(data: UserInfoPublic) => {
    dispatch(setBanned([data]));
    console.log("newPersonnalyBanned", data);
  })

  socket.on("exPersonnalyBanned", (data: fromBackI) => {
    console.log("exPersonnalyBanned", data);
  });

  socket.on("personallyBannedList",(data: UserInfoPublic[]) => {
    dispatch(setBanned(data));
    console.log("personallyBannedList", data);
  })

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
    setNotifyMessage(data.cause)
    console.log(data);
  });

  socket.on("declineInvite", (data: any) => {
    setNotifyMessage(data.cause)
    console.log(data);
  });

  socket.on("executionError", (data: any) => {
    setNotifyMessage(data.cause)

    console.log(data);
  });

  setTimeout(() => {
    socket.emit("getFriends");
    socket.emit("getPersonallyBanned");
  }, 1000)
}

export default socket;