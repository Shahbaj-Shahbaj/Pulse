const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required." });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ error: "Username or email already taken." });

    const user = new User({ username, email, password });
    await user.save();

    req.session.userId   = user._id.toString();
    req.session.username = user.username;

    res.status(201).json({
      message: "Account created!",
      user: { id: user._id, username: user.username, email: user.email, bio: user.bio },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid credentials." });

    req.session.userId   = user._id.toString();
    req.session.username = user.username;

    res.json({
      message: "Logged in!",
      user: { id: user._id, username: user.username, email: user.email, bio: user.bio },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed." });
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out." });
  });
});

// Get current session user
router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Not logged in." });
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
