const jwt = require("jsonwebtoken");

// crear una llave
const generateSign = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// comprobar si esa llave fue creada por el cerrajero

module.exports = { generateSign };
