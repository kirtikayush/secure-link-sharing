const express = require("express");
const cors = require("cors");
const app = express();
const fileRoutes = require("./routes/file.routes");
const authRoutes = require("./routes/auth.routes");
const authMiddleware = require("./middleware/auth.middleware");
const shareRoutes = require("./routes/share.routes");

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "alive" });
});

app.use("/auth", authRoutes);
app.use("/files", fileRoutes);

//?this is just for testing
app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.use("/", shareRoutes);

module.exports = app;
