//! CRUD -> CREATE/POST, READ/GET, UPDATE, DELETE
const { generateSign } = require("../../config/jwt.js");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");

// GET Obtener todos los usuarios (sólo admin)
const getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json("No tienes permisos para ver todos los usuarios");
    }
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

// GET Obtener un usuario en concreto (sólo admin)
const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json("No tienes permisos para ver todos los usuarios");
    }

    // Obtener parámetro
    const { userName } = req.params;

    // Solo puedes ver user si:
    // 1. Es admin
    // 2. Es el mismo usuario dueño del perfil
    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.userName === userName;

    if (!isAdmin && !isOwner) {
      return res.status(403).json("No tienes permisos para ver este usuario");
    }

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json("Usuario no encontrado");
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuario", error: error.message });
  }
};

// POST /user registrar user normal
const registerUser = async (req, res) => {
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
    if (await User.findOne({ userName })) {
      return res.status(409).json("Este usuario ya existe. Por favor, indica otro nombre de usuario.");
    }

    // 4. Comprobar si email está duplicado
    if (await User.findOne({ email })) {
      return res.status(409).json("Este email ya existe. Por favor, registra otro email.");
    }

    // 5. Crear nuevo usuario
    const newUser = new User({ userName, email, password });
    const userSaved = await newUser.save();

    userSaved.password = undefined;

    return res.status(201).json({ message: "Usuario registrado correctamente", user: userSaved });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};

// POST Resgister admin (sólo admin)
const registerAdmin = async (req, res) => {
  try {
    // validar permisos
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json("No tienes permisos para crear un admin");
    }

    const { userName, email, password } = req.body;

    if (!userName || !email || !password) {
      return res.status(400).json("Todos los campos son obligatorios");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Este email no es válido, por favor registra un email con el formato correcto." });
    }

    if (await User.findOne({ userName })) {
      return res.status(409).json("Usuario ya existe");
    }

    if (await User.findOne({ email })) {
      return res.status(409).json("Email ya registrado");
    }

    const newAdmin = new User({ userName, email, password, role: "admin" });
    const adminSaved = await newAdmin.save();
    adminSaved.password = undefined;

    return res.status(201).json({ message: "Admin creado correctamente", user: adminSaved });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear admin", error: error.message });
  }
};

// POST /login user
const loginUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const user = await User.findOne({ $or: [{ userName }, { email }] });

    if (!user) {
      return res.status(404).json("El usuario introducido no existe");
    }

    //3. Comparar contraseña con bcrypt
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json("Contraseña incorrecta");
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

const updateUser = async (req, res) => {
  try {
    const { userName, email, password, newUserName, newEmail, newPassword } = req.body;

    // 1. ID objetivo
    const targetId = req.user.role === "admin" ? req.params.id : req.user._id;

    // 2. Buscar usuario
    const user = await User.findById(targetId);
    if (!user) return res.status(404).json("Usuario no encontrado");

    // 3. Permisos: usuarios normales deben validar su info actual
    if (req.user.role !== "admin") {
      // Comparar userName
      if (user.userName !== userName) {
        return res.status(401).json("El nombre de usuario actual no coincide");
      }
      // Comparar email
      if (user.email !== email) {
        return res.status(401).json("El email actual no coincide");
      }
      // Comparar password actual
      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json("La contraseña actual no coincide");
      }
    }

    // 4. Validar que haya algo para actualizar
    if (!newUserName && !newEmail && !newPassword) {
      return res.status(400).json("Debes enviar al menos un dato nuevo para actualizar.");
    }

    if (newUserName && newUserName === user.userName) {
      return res.status(400).json("El nuevo nombre de usuario es igual al actual");
    }

    if (newEmail && newEmail === user.email) {
      return res.status(400).json("El nuevo email es igual al actual");
    }

    if (newPassword && bcrypt.compareSync(newPassword, user.password)) {
      return res.status(400).json("La nueva contraseña no puede ser igual a la actual");
    }

    // 5. Validar duplicados si llega newUserName
    if (newUserName && newUserName !== user.userName) {
      const nameExists = await User.findOne({ userName: newUserName });
      if (nameExists) return res.status(409).json("Este nombre de usuario ya existe");
      user.userName = newUserName;
    }

    // 6. Validar duplicados si llega newEmail
    if (newEmail && newEmail !== user.email) {
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) return res.status(409).json("Este email ya está registrado");
      user.email = newEmail;
    }

    // 7. Actualizar contraseña (solo asignamos, mongoose la hasheará con pre-save)
    if (newPassword) user.password = newPassword;

    // 8. Guardar
    const updatedUser = await user.save();
    updatedUser.password = undefined;

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en updateUser", error: error.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).json("No tienes permisos para eliminar este usuario");
    }

    const userDeleted = await User.findByIdAndDelete(id);
    if (!userDeleted) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Este usuario ha sido eliminado",
      userDeleted,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el usuario", error });
  }
};

module.exports = { getAllUsers, getUser, registerUser, registerAdmin, loginUser, updateUser, deleteUser };
