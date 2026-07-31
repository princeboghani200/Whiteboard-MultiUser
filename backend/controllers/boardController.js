const Board = require("../models/Board");

//craete board
const createBoard = async (req, res) => {
  try {
    const { name } = req.body;

    const board = await Board.create({
      name: name || "Untitled Board",
      ownerId: req.userId,
      collaborators: [],
      elements: [],
    });

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//get board by id
const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    res.status(200).json(board);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//all board of user
const getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({ ownerId: req.userId }).select(
      "name createdAt updatedAt",
    );
    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
module.exports = { createBoard, getBoard, getMyBoards };
