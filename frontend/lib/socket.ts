import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

let socket: Socket | null = null;

export const connectSocket = (userId: string, token: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  socket = io(API_URL, {
    auth: {
      token: token,
      userId: userId,
    },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  socket.on("error", (error: any) => {
    console.error("Socket error:", error);
  });

  // Handle online users list
  socket.on("online-users-list", (users: any) => {
    console.log("Online users:", users);
  });

  // Handle user online status
  socket.on("user-online", (data: any) => {
    console.log("User online:", data);
  });

  // Handle user offline status
  socket.on("user-offline", (data: any) => {
    console.log("User offline:", data);
  });

  // Handle user joined channel
  socket.on("user-joined-channel", (data: any) => {
    console.log("User joined channel:", data);
  });

  // Handle user left channel
  socket.on("user-left-channel", (data: any) => {
    console.log("User left channel:", data);
  });

  // Handle message edited
  socket.on("message-edited", (message: any) => {
    console.log("Message edited:", message);
  });

  // Handle message deleted
  socket.on("message-deleted", (data: any) => {
    console.log("Message deleted:", data);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};
