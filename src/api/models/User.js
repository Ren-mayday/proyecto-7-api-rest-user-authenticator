// Schema/plantilla
const mongoose = require("mongoose"); // Traerme la librería mongoose
const bcrypt = require("bcrypt"); // Traerme bcrypt
const GameSession = require("./GameSession");

//1. Defino el Schema, voy a necesitar nombre, email, password y role
const userSchema = new mongoose.Schema(
  {
    userName: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

// Middleware de borrado
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const userId = this.getQuery()._id;
    if (!userId) return next();

    await GameSession.deleteMany({ user: userId }); // Limpieza automática
    next();
  } catch (error) {
    next(error);
  }
});

// 2. Creo el modelo a partir del Schema
const User = mongoose.model("User", userSchema, "users");
module.exports = User;
