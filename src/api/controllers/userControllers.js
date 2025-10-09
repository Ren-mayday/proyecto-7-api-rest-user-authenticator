//! CRUD -> CREATE/POST, READ/GET, UPDATE, DELETE
const { generateSign } = require("../../config/jwt.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");

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
      return res.status(409).json("Este usuario ya existe. Por favor, indica otro nombre de usuario.");
    }
    // 4. Comprobar si email está duplicado
    const emailDuplicated = await User.findOne({ email });
    if (emailDuplicated) {
      return res.status(409).json("Este email ya existe. Por favor, registra otro email.");
    }

    // 5. Crear nuevo usuario
    const newUser = new User({ userName, email, password });
    const userSaved = await newUser.save();

    return res.status(201).json({ message: "Usuario registrado correctamente", user: userSaved });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};

// POST /login user
const loginUser = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;

    const user = await User.findOne({ $or: [{ userName }, { email }] });

    if (!user) {
      return res.status(404).json("El usuario introducido no existe");
    }

    //3. Comparar contraseña con bcrypt
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json("El usuario o la contraseña son incorrectos");
    }

    // Si todo está bien -> generar token JWT
    const token = generateSign(user._id);

    //4. Si user y password ok
    return res.status(200).json({
      message: "Te has logueado correctamente",
      token,
      user: { id: user._id, userName: user.userName, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor al intentar loguear", error: error.message });
  }
};

module.exports = { registerUser, loginUser };
