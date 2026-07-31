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

// Socket.io connection handling — we'll expand this in Step 9
const Board = require("./models/Board");

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client tells us which board they want to join
  socket.on("join-room", async (boardId) => {
    socket.join(boardId);
    console.log(`Socket ${socket.id} joined room ${boardId}`);

    try {
      const board = await Board.findById(boardId);
      if (board) {
        // Send the current full board state ONLY to this newly joined client
        socket.emit("board-sync", board.elements);
      }
    } catch (err) {
      console.error("Error syncing board:", err.message);
    }
  });

  socket.on("element-add", async ({ boardId, element }) => {
    try {
      // Broadcast to everyone else in the room (NOT back to the sender)
      socket.to(boardId).emit("element-add", element);

      // Persist to MongoDB
      await Board.findByIdAndUpdate(boardId, {
        $push: { elements: element },
      });
    } catch (err) {
      console.error("Error handling element-add:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
