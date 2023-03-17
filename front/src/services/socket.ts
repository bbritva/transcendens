import { Dispatch } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { channelFromBackI, fromBackI, NameSuggestionInfoI, newMessageI, userFromBackI } from 'src/pages/Chat/ChatPage';
import { GameStateDataI } from 'src/pages/Game/components/game/game';
import { deleteBanned, deleteFriend, setBanned, setFriends, UserInfoPublic } from 'src/store/chatSlice';

const URL = process.env.REACT_APP_AUTH_URL || "";
const socket = io(URL, { autoConnect: false });

export function initSocket(
  navigate: Function,
  setGameData: Function,
  // gameData: InitialGameDataI | null,
  setChannels: Function,
  dispatch: Dispatch
) {

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
      navigate("/game", { replace: false });
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

  socket.on("exFriend", (data: UserInfoPublic) => {
    dispatch(deleteFriend(data))
  });

  socket.on("friendList",(data: UserInfoPublic[]) => {
    dispatch(setFriends(data));
  })

  socket.on("newPersonnalyBanned",(data: UserInfoPublic) => {
    dispatch(setBanned([data]));
    console.log("newPersonnalyBanned", data);
  })

  socket.on("exPersonnalyBanned", (data: UserInfoPublic) => {
    dispatch(deleteBanned(data))
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

  socket.on("nameSuggestions", (data: NameSuggestionInfoI[]) => {
    console.log("nameSuggestions", data);
  });

  socket.on("activeGames", (data: GameStateDataI[]) => {
    console.log("activeGames", data);
  });

  socket.on("notAllowed", (data: any) => {
    console.log(data);
  });

  socket.on("executionError", (data: any) => {
    console.log(data);
  });

  setTimeout(() => {
    socket.emit("getFriends");
    socket.emit("getPersonallyBanned");
  }, 1000)
}

export default socket;