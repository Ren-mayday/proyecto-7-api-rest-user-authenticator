const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  },
  {
    timestamps: true,
    collection: "games",
  }
);

const Game = mongoose.model("Game", gameSchema, "games");
module.exports = Game;
