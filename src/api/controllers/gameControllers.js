//! CRUD -> CREATE/POST, READ/GET, UPDATE, DELETE
const Game = require("../models/Game");

// CREATE (solo admin)
const createGame = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("No tienes permisos para crear juegos");
    }

    const { name, slug, description, difficulty } = req.body;

    if (!name || !slug || !description) {
      return res.status(400).json("Faltan campos obligatorios");
    }

    const slugLower = slug.toLowerCase();

    const duplicated = await Game.findOne({ slug: slugLower });
    if (duplicated) {
      return res.status(409).json("Ya existe un juego con este slug");
    }

    const newGame = new Game({
      name,
      slug: slugLower,
      description,
      difficulty,
    });

    const savedGame = await newGame.save();
    return res.status(201).json(savedGame);
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el juego",
      error: error.message,
    });
  }
};

// READ ALL
const getAllGames = async (req, res) => {
  try {
    const games = await Game.find();
    return res.status(200).json(games);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los juegos",
      error: error.message,
    });
  }
};

// READ ONE by slug
const getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const game = await Game.findOne({ slug });

    if (!game) {
      return res.status(404).json("Juego no encontrado");
    }

    return res.status(200).json(game);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el juego",
      error: error.message,
    });
  }
};

// UPDATE (solo admin)
const updateGame = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("No tienes permisos para actualizar juegos");
    }

    const { id } = req.params;

    const updatedGame = await Game.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedGame) {
      return res.status(404).json("Juego no encontrado");
    }

    return res.status(200).json(updatedGame);
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el juego",
      error: error.message,
    });
  }
};

// DELETE (solo admin)
const deleteGame = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("No tienes permisos para eliminar juegos");
    }

    const { id } = req.params;

    const deletedGame = await Game.findByIdAndDelete(id);

    if (!deletedGame) {
      return res.status(404).json("Juego no encontrado");
    }

    return res.status(200).json({
      message: "Juego eliminado correctamente",
      deletedGame,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el juego",
      error: error.message,
    });
  }
};

module.exports = {
  createGame,
  getAllGames,
  getGameBySlug,
  updateGame,
  deleteGame,
};
