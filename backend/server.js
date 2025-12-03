const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const User = require("./models/User");


dotenv.config();


connectDB();

const app = express();
const server = http.createServer(app);


const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/channels", require("./routes/channels"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/users", require("./routes/users"));
app.use("/api/invites", require("./routes/invites"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.userId = userId;
      const user = await User.findById(userId);
      if (user) {
        socket.user = user;
        next();
      } else {
        next(new Error("User not found"));
      }
    } else {
      next(new Error("Authentication error"));
    }
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Store online users
const onlineUsers = new Map();

io.on("connection", async (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Update user online status
  await User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: new Date(),
  });


  onlineUsers.set(socket.userId, {
    username: socket.user.username,
    socketId: socket.id,
    joinedAt: new Date(),
  });


  io.emit("user-online", {
    userId: socket.userId,
    username: socket.user.username,
    isOnline: true,
    onlineUsersCount: onlineUsers.size,
  });

  // Send current online users to newly connected client
  const onlineUsersList = Array.from(onlineUsers.values()).map((user, key) => ({
    ...user,
    userId: Array.from(onlineUsers.keys())[key],
  }));
  socket.emit("online-users-list", onlineUsersList);

  
  socket.on("join-channel", (channelId) => {
    socket.join(`channel:${channelId}`);
    console.log(`User ${socket.userId} joined channel ${channelId}`);

    
    io.to(`channel:${channelId}`).emit("user-joined-channel", {
      userId: socket.userId,
      username: socket.user.username,
      channelId: channelId,
    });
  });

  // Leave channel room
  socket.on("leave-channel", (channelId) => {
    socket.leave(`channel:${channelId}`);
    console.log(`User ${socket.userId} left channel ${channelId}`);

    // Notify channel that user left
    io.to(`channel:${channelId}`).emit("user-left-channel", {
      userId: socket.userId,
      username: socket.user.username,
      channelId: channelId,
    });
  });

  // Send message
  socket.on("send-message", async (data) => {
    try {
      const Message = require("./models/Message");
      const Channel = require("./models/Channel");

      const channel = await Channel.findById(data.channelId);
      if (!channel) {
        socket.emit("error", { message: "Channel not found" });
        return;
      }

      const message = await Message.create({
        content: data.content,
        sender: socket.userId,
        channel: data.channelId,
      });

      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "username email avatar"
      );

      io.to(`channel:${data.channelId}`).emit("new-message", populatedMessage);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Edit message
  socket.on("edit-message", async (data) => {
    try {
      const Message = require("./models/Message");

      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      if (message.sender.toString() !== socket.userId) {
        socket.emit("error", {
          message: "Not authorized to edit this message",
        });
        return;
      }

      message.content = data.content;
      message.isEdited = true;
      message.editedAt = new Date();
      await message.save();

      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "username email avatar"
      );

      io.to(`channel:${data.channelId}`).emit(
        "message-edited",
        populatedMessage
      );
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Delete message
  socket.on("delete-message", async (data) => {
    try {
      const Message = require("./models/Message");

      const message = await Message.findById(data.messageId);
      if (!message) {
        socket.emit("error", { message: "Message not found" });
        return;
      }

      if (message.sender.toString() !== socket.userId) {
        socket.emit("error", {
          message: "Not authorized to delete this message",
        });
        return;
      }

      await message.deleteOne();
      io.to(`channel:${data.channelId}`).emit("message-deleted", {
        messageId: data.messageId,
        channelId: data.channelId,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(`channel:${data.channelId}`).emit("user-typing", {
      userId: socket.userId,
      username: socket.user.username,
      channelId: data.channelId,
    });
  });

  // Stop typing
  socket.on("stop-typing", (data) => {
    socket.to(`channel:${data.channelId}`).emit("user-stop-typing", {
      userId: socket.userId,
      channelId: data.channelId,
    });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.userId}`);

    // Remove user from online users map
    onlineUsers.delete(socket.userId);

    // Update user offline status
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date(),
    });

    // Emit offline status to all clients
    io.emit("user-offline", {
      userId: socket.userId,
      isOnline: false,
      onlineUsersCount: onlineUsers.size,
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
