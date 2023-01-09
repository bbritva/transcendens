import { Dispatch } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { channelFromBackI, newMessageI, userFromBackI } from 'src/pages/Chat/ChatPage';
import { logout } from 'src/store/authActions';
import { userI } from 'src/store/userSlice';


const URL = process.env.REACT_APP_AUTH_URL || '';
const socket = io(URL, { autoConnect: false });

export function initSocket(
    user: userI | null,
    users: userFromBackI[],
    setUsers: Function,
    setChannels: Function,
    setUserMessages: Function,
    dispatch: Dispatch,
  ){
  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      dispatch(logout());
    }
  });

  socket.on("channels", (channels: channelFromBackI[]) => {
    setChannels(channels);
  });

  socket.on("user connected", (channelName: string, userName: string) => {
    console.log("user Connected", channelName, userName);
    setChannels((prev: channelFromBackI[]) => {
      const channelInd = prev.findIndex((el) => el.name === channelName)
      if (channelInd !== -1) {
        const res = [...prev];
        const userInd = res[channelInd].users.findIndex((el) => el.name === userName);
        if (userInd === -1)
          return prev;
        res[channelInd].users[userInd].connected = true;
        return res;
      }
      return prev;
    });
  });

  socket.on("joined to channel", (channel: channelFromBackI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === channel.name)
      const res = [...prev];
      channel.connected = true;
      if (ind !== -1)
        res[ind] = channel;
      else
        res.push(channel);
      return res;
    });
  });

  socket.on("onMessage", (message: newMessageI) => {
    setChannels((prev: channelFromBackI[]) => {
      const ind = prev.findIndex((el) => el.name === message.channelName)
      const res = [...prev];
      if (ind !== -1){
        res[ind].messages.push(message);
      }
      return res;
    });
  });

  socket.on("connect", () => {
    users.forEach((user) => {
      if (user.id) {
        user.connected = true;
      }
    });
  });

  socket.on("disconnect", () => {
    users.forEach((user) => {
      if (user.id) {
        user.connected = false;
      }
    });
  });
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
}

export default socket