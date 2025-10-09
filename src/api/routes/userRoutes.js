const { registerUser, loginUser } = require("../controllers/userControllers");

const usersRoutes = require("express").Router();

usersRoutes.post("/register", registerUser);
usersRoutes.post("/login", loginUser);

module.exports = usersRoutes;
