const mongoose = require("mongoose");

const elementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // client-generated UUID, not Mongo _id
    type: {
      type: String,
      enum: ["path", "rect", "circle", "text", "line"],
      required: true,
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, _id: false },
);

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Board",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    elements: [elementSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Board", boardSchema);
