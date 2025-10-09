const { registerUser } = require("../controllers/userControllers");

const usersRoutes = require("express").Router();

usersRoutes.post("/register", registerUser);

module.exports = usersRoutes;
