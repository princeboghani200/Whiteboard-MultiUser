require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, method: ["GET", "POST"] },
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);

const boardRoutes = require("./routes/boardRoutes");
app.use("/api/boards", boardRoutes);

const Board = require("./models/Board");

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-room", async (boardId, userName) => {
    socket.join(boardId);
    socket.data.boardId = boardId;
    socket.data.userName = userName;

    if (!activeUsers[boardId]) activeUsers[boardId] = {};
    activeUsers[boardId][socket.id] = { name: userName };

    socket.to(boardId).emit("user-joined", { name: userName });

    const currentUsers = Object.values(activeUsers[boardId]);
    io.to(boardId).emit("active-users", currentUsers);

    try {
      const board = await Board.findById(boardId);
      if (board) {
        socket.emit("board-sync", board.elements);
      }
    } catch (err) {
      console.error("Error syncing board:", err.message);
    }
  });

  socket.on("element-add", async ({ boardId, element }) => {
    try {
      socket.to(boardId).emit("element-add", element);

      await Board.findByIdAndUpdate(boardId, {
        $push: { elements: element },
      });
    } catch (err) {
      console.error("Error handling element-add:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);

    const { boardId, userName } = socket.data;

    if (boardId && activeUsers[boardId]) {
      delete activeUsers[boardId][socket.id];

      socket.to(boardId).emit("user-left", { name: userName });

      const currentUsers = Object.values(activeUsers[boardId]);
      io.to(boardId).emit("active-users", currentUsers);

      if (Object.keys(activeUsers[boardId]).length === 0) {
        delete activeUsers[boardId];
      }
    }
  });

  socket.on("cursor-move", ({ boardId, x, y, name }) => {
    socket.to(boardId).emit("cursor-move", { socketId: socket.id, x, y, name });
  });
});

const activeUsers = {};

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
