const mongoose = require("mongoose");

const gameSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
    score: { type: Number, default: 0 },
    duration: { type: Number },
    result: { type: String, enum: ["win", "lose", "draw", "unfinished"] },

    moves: { type: String, timestamps: Date },
  },
  {
    timestamps: true,
  }
);

const GameSession = mongoose.model("GameSession", gameSessionSchema, "gamesessions");
module.exports = GameSession;
