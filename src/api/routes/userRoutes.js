const { isAdmin } = require("../../middlewares/isAdmin");
const { isAuth } = require("../../middlewares/isAuth");
const {
  getAllUsers,
  getUser,
  registerUser,
  registerAdmin,
  loginUser,
  updateUser,
  deleteUser,
  updateUserRole,
} = require("../controllers/userControllers");

const usersRoutes = require("express").Router();

// Obtener todos los usuarios -> SOLO ADMIN (protegido con isAuth)
usersRoutes.get("/", [isAuth, isAdmin], getAllUsers);
usersRoutes.get("/user/:userName", [isAuth], getUser);

// Registro y login
usersRoutes.post("/register", registerUser);

// Registrar admin -> SOLO ADMIN (protegido)
usersRoutes.post("/register/admin", [isAuth, isAdmin], registerAdmin);

usersRoutes.post("/login", loginUser);

// Update -> solo autenticados, admin o usuario normal
usersRoutes.put("/update/:id", [isAuth], updateUser);

// Update role -> sólo admin puede cambiar role
usersRoutes.patch("/:id/role", [isAuth, isAdmin], updateUserRole);

// Delete -> solo autenticados (admin o users así mismos)
usersRoutes.delete("/:id", [isAuth], deleteUser);

module.exports = usersRoutes;
