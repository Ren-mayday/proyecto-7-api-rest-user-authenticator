//! CRUD -> CREATE/POST, READ/GET, UPDATE, DELETE
const GameSession = require("../models/GameSession");
const Game = require("../models/Game");

// CREATE
const createSession = async (req, res) => {
  try {
    const { gameId, score, duration } = req.body;

    const game = await Game.findById(gameId);
    if (!game) return res.status(404).json("Juego no encontrado");

    const newSession = new GameSession({
      user: req.user._id,
      game: gameId,
      score,
      duration,
    });

    const savedSession = await newSession.save();
    return res.status(201).json(savedSession);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear sesión", error: error.message });
  }
};

// GET ALL (solo admin)
const getAllSessions = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Sólo un admin puede ver todas las sesiones");
    }

    const sessions = await GameSession.find().populate("user", "userName email").populate("game", "name");

    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener sesiones", error: error.message });
  }
};

// GET sessions de un usuario
const getUserSessions = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json("No puedes ver sesiones de otros usuarios");
    }

    const sessions = await GameSession.find({ user: id }).populate("game", "name");
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener sesiones del usuario", error: error.message });
  }
};

// GET sessions de un juego
const getGameSessions = async (req, res) => {
  try {
    const { id } = req.params;
    const sessions = await GameSession.find({ game: id }).populate("user", "userName").populate("game", "name");
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener sesiones del juego", error: error.message });
  }
};

// GET una sesión
const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await GameSession.findById(id).populate("user", "userName").populate("game", "name");

    if (!session) return res.status(404).json("Sesión no encontrada");

    if (req.user.role !== "admin" && req.user._id.toString() !== session.user._id.toString()) {
      return res.status(403).json("No puedes ver esta sesión");
    }

    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener sesión", error: error.message });
  }
};

// DELETE
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await GameSession.findById(id);
    if (!session) return res.status(404).json("Sesión no encontrada");

    if (req.user.role !== "admin" && req.user._id.toString() !== session.user.toString()) {
      return res.status(403).json("No puedes borrar esta sesión");
    }

    await GameSession.findByIdAndDelete(id);
    return res.status(200).json({ message: "Sesión eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar sesión", error: error.message });
  }
};

module.exports = {
  createSession,
  getAllSessions,
  getUserSessions,
  getGameSessions,
  getSession,
  deleteSession,
};
