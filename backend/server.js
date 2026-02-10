require("dotenv").config();
const app = require("./src/app");
const {testConnection} = require("./src/config/db")

const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`)
// });

async function startServer() {
  try {
    await testConnection()
    console.log("Database connected")

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error("Database connection failed:", err.message)
    process.exit(1)
  }
}

startServer()