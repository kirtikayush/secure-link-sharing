const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes");
const shareRoutes = require("./routes/share.routes");

const app = express();

// 🔴 CORS FIRST
app.use(
  cors({
    origin: "*", // TEMP: allow all (we’ll tighten later)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔴 Explicit OPTIONS handler
app.options("*", cors());

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "alive" });
});

app.use("/auth", authRoutes);
app.use("/files", fileRoutes);
app.use("/", shareRoutes);

module.exports = app;
