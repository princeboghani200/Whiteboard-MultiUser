import { io } from "socket.io-client";

const socket = io("https://whiteboard-backend-nfzb.onrender.com", {
  autoConnect: false,
});

export default socket;
