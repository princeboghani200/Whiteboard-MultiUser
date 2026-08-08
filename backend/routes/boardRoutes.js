const express = require("express");
const {
  createBoard,
  getMyBoards,
  getBoard,
  joinBoard,
} = require("../controllers/boardController");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createBoard);
router.get("/mine", protect, getMyBoards);
router.get("/:id", protect, getBoard);
router.post("/:id/join", protect, joinBoard);

module.exports = router;
