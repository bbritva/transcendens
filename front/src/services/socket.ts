import { io, Socket } from 'socket.io-client';


const URL = process.env.REACT_APP_AUTH_URL || '';
const socket = io(URL, { autoConnect: false });

export default socket