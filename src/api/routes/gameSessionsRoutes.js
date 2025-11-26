const { isAuth } = require("../../middlewares/isAuth");
const { isAdmin } = require("../../middlewares/isAdmin");

const {
  createSession,
  getAllSessions,
  getUserSessions,
  getGameSessions,
  getSession,
  deleteSession,
  updateSession,
} = require("../controllers/gameSessionControllers");

const gameSessionsRoutes = require("express").Router();

// CREATE (usuario logueado)
gameSessionsRoutes.post("/", [isAuth], createSession);

// READ
gameSessionsRoutes.get("/", [isAuth, isAdmin], getAllSessions); // Sólo admin
gameSessionsRoutes.get("/user/:id", [isAuth], getUserSessions); // usuario o admin
gameSessionsRoutes.get("/game/:id", [isAuth], getGameSessions); // usuario o público según necesidad
gameSessionsRoutes.get("/:id", [isAuth], getSession); // dueño o admin

// UPDATE
gameSessionsRoutes.put("/:id", [isAuth], updateSession); // dueño o admin

// DELETE (admin o dueño)
gameSessionsRoutes.delete("/:id", [isAuth], deleteSession);

module.exports = gameSessionsRoutes;
