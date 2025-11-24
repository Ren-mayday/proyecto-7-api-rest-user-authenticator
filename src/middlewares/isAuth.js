const { verifyJWT } = require("../config/jwt");
const User = require("../api/models/User");

const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(403).json("No estás autorizado para hacer esta acción.");
    }

    const parsedToken = token.replace("Bearer ", "");

    const { id } = verifyJWT(parsedToken);

    const user = await User.findById(id);

    if (!user) {
      return res.status(403).json("Token inválido o usuario no encontrado");
    }

    // Guardar el usuario completo en req.user
    req.user = user;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "No estás autorizado para realizar esta acción",
      error: error.message,
    });
  }
};

module.exports = { isAuth };
