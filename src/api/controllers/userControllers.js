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

    const user = await User.findOne({ userName }).select("-password");

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

    const errorMessage = "Usuario o contraseña incorrectos";

    if (!user) {
      return res.status(404).json({ message: errorMessage });
    }

    //3. Comparar contraseña con bcrypt
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: errorMessage });
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
    const { id } = req.params;
    const { newUserName, newEmail, newPassword, newRole, currentPassword } = req.body;

    // 1. Buscar usuario objetivo
    const user = await User.findById(id).select("+password");

    if (!user) {
      return res.status(404).json("Usuario no encontrado");
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user._id.equals(user._id);

    // 2. Permisos
    // Admin puede actualizar cualquier user
    // Usuario normal solo puede actualizar su propio perfil
    if (!isAdmin && !isOwner) {
      return res.status(403).json("No puedes modificar este usuario");
    }

    // 3. Si NO es admin, debe validar su contraseña para actualizar datos
    if (!isAdmin) {
      if (!currentPassword) {
        return res.status(400).json("Debes enviar tu contraseña actual para actualizar tus datos");
      }

      const isValidPass = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPass) {
        return res.status(401).json("La contraseña actual es incorrecta");
      }
    }

    // 4. Campos editables

    // -- Role (sólo admin) --

    if (newRole) {
      if (!isAdmin) {
        return res.status(403).json("Sólo un admin puede cambiar roles");
      }
      if (!["admin", "user"].includes(newRole)) {
        return res.status(400).json("Role inválido, Debe ser 'admin' o 'user'");
      }
      if (user.role !== newRole) {
        user.role = newRole;
      }
    }

    // -- Nombre usuario --
    if (newUserName && newUserName !== user.userName) {
      const exists = await User.findOne({ userName: newUserName });
      if (exists) return res.status(409).json("Este nombre de usuario ya existe");
      user.userName = newUserName;
    }

    // -- Email --
    if (newEmail && newEmail !== user.email) {
      const exists = await User.findOne({ email: newEmail });
      if (exists) return res.status(409).json("Este email ya está registrado");
      user.email = newEmail;
    }

    // -- Contraseña --
    if (newPassword) {
      const same = await bcrypt.compare(newPassword, user.password);
      if (same) {
        return res.status(400).json("La nueva contraseña no puede ser igual a la actual");
      }
      user.password = newPassword; // mongoose la hashea por el pre-save
    }

    // 5. Guardar cambios
    const updated = await user.save();

    // 6. Limpiar password antes de enviar
    const userObj = updated.toObject();
    delete userObj.password;

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: userObj,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error en updateUser",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const isAdmin = req.user.role === "admin";
    const isOwner = req.user._id.equals(new mongoose.Types.ObjectId(id));

    if (!isAdmin && !isOwner) {
      return res.status(403).json("No tienes permisos para eliminar este usuario");
    }

    // 1. Buscar usuario
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // 2. Eliminarlo después
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Usuario y sus sesiones asociadas han sido eliminados",
      userDeleted: user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  registerUser,
  registerAdmin,
  loginUser,
  updateUser,
  deleteUser,
};
