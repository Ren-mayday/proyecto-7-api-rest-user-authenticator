const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json("No tienes permisos de administrador");
  }
  next();
};

module.exports = { isAdmin };
