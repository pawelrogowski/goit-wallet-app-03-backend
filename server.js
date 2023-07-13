require("dotenv").config();

// server.js can possibly be consolidated into app.js or vice-versa leaving just one of them
const app = require("./app");
const mongoose = require("mongoose");

const Port = process.env.APP_PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", async function () {
  console.log("Database connection successful");
});

db.on("error", function (err) {
  console.error("Database connection error:", err);
  process.exit(1);
});

process.on("exit", function (code) {
  if (code === 1) {
    console.error("Application exited with error");
  }
});

app.listen(Port, () => {
  console.log(`Server running. Use our API on port: ${Port}`);
});
