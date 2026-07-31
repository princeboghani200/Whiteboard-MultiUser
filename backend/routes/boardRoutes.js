const express = require("express");
const {
  createBoard,
  getMyBoards,
  getBoard,
} = require("../controllers/boardController");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

router.post("/", protect, createBoard);
router.get("/mine", protect, getMyBoards);
router.get("/:id", protect, getBoard);

module.exports = router;