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

  socket.on("users", (users: userFromBackI[]) => {
    users.splice(users.findIndex(
      (el) => {
        return el.name == user?.name}
      ));
    setUsers(users);
  });

  socket.on("channels", (channels: channelFromBackI[]) => {
    setChannels(channels);
  });

  socket.on("user connected", (channelName: string, userName: string) => {
    console.log("user Connected", channelName, userName);
    //TODO user list should be updated in proper channel :(
    //set the connected user online
    setUsers((prev: userFromBackI[]) => [...prev, {name: userName}]);
  });

  socket.on("joined to channel", (channel, user) => {
    console.log("user Connected", channel, user);
    //TODO user list should be updated in proper channel :(
    //set the connected user online
    setUsers((prev: userFromBackI[]) => [...prev, {name: user}]);
  });

  socket.on("private message", (message: newMessageI) => {
    setUserMessages(setUsers, message);
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