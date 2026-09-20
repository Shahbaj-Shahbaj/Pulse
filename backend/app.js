require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

app.set("trust proxy", 1);

const DB_PATH = process.env.MONGO_URI;

// ======================================================
// MongoDB Session Store
// ======================================================

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions",
});

store.on("error", (err) => {
  console.error("Session store error:", err);
});

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ======================================================
// Body Parser
// ======================================================

app.use(express.json());

// ======================================================
// Session
// ======================================================

const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,

    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,

      // Local: HTTP → false
      // Production: HTTPS → true
      secure: isProduction,

      // Local development → lax
      // Production frontend/backend → none
      sameSite: isProduction ? "none" : "lax",
    },
  })
);

// ======================================================
// Routes
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// ======================================================
// Health Check
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Pulse API running",
  });
});

// ======================================================
// Connect to MongoDB and Start Server
// ======================================================

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });