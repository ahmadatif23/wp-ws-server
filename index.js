// index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

// Simple test route
app.get("/", (req, res) => res.send("Chat server running..."));

// Use the port Render provides
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for testing
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join room
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    socket.room = roomName;
    console.log(`📥 ${socket.id} joined room: ${roomName}`);
    socket.to(roomName).emit("systemMessage", `User joined the room`);
  });

  // Chat messages
  socket.on("chatMessage", (data) => {
    const { room, name, message } = data;
    io.to(room).emit("chatMessage", { name, message });
    console.log(`💬 [${room}] ${name}: ${message}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    if (socket.room) {
      socket.to(socket.room).emit("systemMessage", `User left the room`);
    }
  });
});

// Listen on Render port
server.listen(PORT, () =>
  console.log(`🚀 Chat server running on port ${PORT}`)
);
