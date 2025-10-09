// Schema/plantilla
const mongoose = require("mongoose"); // Traerme la librería mongoose
const bcrypt = require("bcrypt"); // Traerme bcrypt

//1. Defino el Schema, voy a necesitar nombre, email, password y role
const userSchema = new mongoose.Schema(
  {
    userName: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

// 2. Creo el modelo a partir del Schema
const User = mongoose.model("User", userSchema, "users");
module.exports = User;
