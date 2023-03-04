import { Dispatch } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import { channelFromBackI, fromBackI, newMessageI, userFromBackI } from 'src/pages/Chat/ChatPage';
import { logout } from 'src/store/authActions';
import { setUsers, UserInfoPublic } from 'src/store/chatSlice';
import { userI } from 'src/store/userSlice';


const URL = process.env.REACT_APP_AUTH_URL || '';
const socket = io(URL, { autoConnect: false });

export function initSocket(
    setChannels: Function,
    dispatch: Dispatch,
  ){
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

  socket.on("joinedToChannel", (channel: channelFromBackI) => {
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

  socket.on("newMessage", (message: newMessageI) => {
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

  });

  socket.on("disconnect", () => {

  });

  socket.onAny((data: any) => {
    console.log("received", data);
    
  })


  socket.on("userStat",(data: fromBackI) => {
    console.log("userStat", data);
  })

  socket.on("ladder",(data: fromBackI[]) => {
    console.log("userStat", data);
  })
  
  socket.on("newFriend",(data: fromBackI) => {
    console.log("newFriend", data);
  })

  socket.on("exFriend",(data: fromBackI) => {
    console.log("exFriend", data);
  })

  socket.on("friendList",(data: UserInfoPublic[]) => {
    console.log("friendList", data);
    dispatch(setUsers({friends: data}));
  })

  socket.on("newPersonnalyBanned",(data: fromBackI) => {
    console.log("newPersonnalyBanned", data);
  })

  socket.on("exPersonnalyBanned",(data: fromBackI) => {
    console.log("exPersonnalyBanned", data);
  })

  socket.on("personallyBannedList",(data: fromBackI[]) => {
    console.log("personallyBannedList", data);
  })

  socket.on("notAllowed", (data: {
    eventName: string;
    data: any;
  }) => {
    console.log(data);
  });

  socket.emit("getFriends");
}

export default socket