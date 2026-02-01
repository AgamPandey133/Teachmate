import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      return callback(null, true);
    },
    methods: ["GET", "POST"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId);
    console.log(`User ${userId} connected and joined room ${userId}`);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // WebRTC Signaling
  socket.on("callUser", (data) => {
    console.log(`[Signaling] callUser from ${data.from} to ${data.userToCall}`);
    
    // Check if room exists/has members
    const room = io.sockets.adapter.rooms.get(data.userToCall);
    if (!room || room.size === 0) {
        console.log(`[Signaling] User ${data.userToCall} is NOT in any room/offline.`);
    } else {
        console.log(`[Signaling] Sending invitation to room ${data.userToCall} (size: ${room.size})`);
    }

    // Emit to the user's room (handles multiple tabs)
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    console.log("answerCall event received:", data);
    // Emit to the caller's room
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // Language Timer Events
  socket.on("timer-start", (data) => {
    // Broadcast to the user they are chatting with
    // data should contain { to: userId, duration: minutes }
    const endTime = Date.now() + data.duration * 60 * 1000;
    io.to(data.to).emit("timer-update", { endTime });
    // Also emit back to sender to confirm sync
    socket.emit("timer-update", { endTime });
  });
});

export { io, app, server };
