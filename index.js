// index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("Chat server running..."));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for testing (we’ll tighten later)
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
    socket
      .to(roomName)
      .emit("systemMessage", `User ${socket.id} joined the room`);
  });

  // When someone sends a chat message
  socket.on("chatMessage", (data) => {
    const { room, name, message } = data;
    console.log(`💬 [${room}] ${name}: ${message}`);
    io.to(room).emit("chatMessage", { name, message });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    if (socket.room) {
      socket
        .to(socket.room)
        .emit("systemMessage", `User ${socket.id} left the room`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Chat server running on port ${PORT}`)
);
