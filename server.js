require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/config/db");
const usersRoutes = require("./src/api/routes/userRoutes");

const app = express();
connectDB();

//! middleware, línea para configurar que mi servidor sea capaz de recoger datos en formato json
app.use(express.json());

app.use("/api/v1/users", usersRoutes);

// middleware, todas las rutas que no tengan respuesta entrarán por aquí
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor levantado en: http://localhost:${PORT}`);
});
