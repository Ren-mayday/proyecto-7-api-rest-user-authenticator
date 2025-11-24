const { isAuth } = require("../../middlewares/isAuth");
const { isAdmin } = require("../../middlewares/isAdmin");

const { createGame, getAllGames, getGameBySlug, updateGame, deleteGame } = require("../controllers/gameControllers");

const gameRoutes = require("express").Router();

// READ
gameRoutes.get("/", getAllGames);
gameRoutes.get("/:slug", getGameBySlug);

// CREATE (admin)
gameRoutes.post("/", [isAuth, isAdmin], createGame);

// UPDATE (admin)
gameRoutes.put("/:id", [isAuth, isAdmin], updateGame);

// DELETE (admin)
gameRoutes.delete("/:id", [isAuth, isAdmin], deleteGame);

module.exports = gameRoutes;
