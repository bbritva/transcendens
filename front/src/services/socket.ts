import { Dispatch } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { newMessageI, userFromBackI } from 'src/pages/Chat/ChatPage';
import { logout } from 'src/store/authActions';
import { userI } from 'src/store/userSlice';


const URL = process.env.REACT_APP_AUTH_URL || '';
const socket = io(URL, { autoConnect: false });

export function initSocket(
    user: userI | null,
    users: userFromBackI[],
    setUsers: Function,
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
        return el.username == user?.name}
      ));
    setUsers(users);
  });

  socket.on("user connected", (user: userFromBackI) => {
    setUsers((prev: userFromBackI[]) => [...prev, user]);
  });

  socket.on("private message", (message: newMessageI) => {
    setUserMessages(setUsers, message);
  });

  socket.on("connect", () => {
    users.forEach((user) => {
      if (user.userID) {
        user.connected = true;
      }
    });
  });

  socket.on("disconnect", () => {
    users.forEach((user) => {
      if (user.userID) {
        user.connected = false;
      }
    });
  });
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });
}

export default socket