require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../api/models/User.js");
const users = require("../utils/Seeds/users.seeds.js");

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Conectado a la BBDD con éxito");

    const allUsers = await User.find();

    if (allUsers.length) {
      await User.collection.drop();
      console.log("Colección de users eliminada");
    }

    await User.insertMany(users);
    console.log("Personajes insertados correctamente");
  } catch (error) {
    console.error(" Error en el proceso de insertar la seed: ", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de la BBDD");
  }
};

seedUsers();
