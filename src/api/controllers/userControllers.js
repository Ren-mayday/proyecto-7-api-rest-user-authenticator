//! CRUD -> CREATE/POST, READ/GET, UPDATE, DELETE
const User = require("../models/User.js");

// POST /user registrar user
const registerUser = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    // 1. Validar datos obligatorios
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // 2. Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Este email no es válido, por favor registra un email con el formato correcto." });
    }

    // 3. Comprobar si user name está duplicados
    const userDuplicated = await User.findOne({ userName });
    if (userDuplicated) {
      return res.status(409).json("Este nombre de usuario ya existe. Por favor, indica otro nombre de usuario.");
    }
    // 4. Comprobar si email está duplicado
    const emailDuplicated = await User.findOne({ email });
    if (emailDuplicated) {
      return res.status(409).json("Este email ya existe. Por favor, registra otro email.");
    }

    // 5. Crear nuevo usuario
    const newUser = new User({ userName, email, password });
    const userSaved = await newUser.save();

    return res.status(201).json(userSaved);
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};

const login = async (req, res, next) => {
  try {
  } catch (error) {}
};

module.exports = { registerUser };
