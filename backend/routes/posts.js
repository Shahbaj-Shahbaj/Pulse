const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { requireAuth } = require("../middleware/auth");

// GET all posts
router.get("/", async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.$or = [
      { title: { $regex: search, $options: "i" } },
      { body:  { $regex: search, $options: "i" } },
    ];
    if (tag) query.tags = tag;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);
    res.json({ posts, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// GET user posts
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// CREATE post
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, body, tags, mood, location } = req.body;
    if (!title || !body)
      return res.status(400).json({ error: "Title and body are required." });

    const post = new Post({
      title,
      body,
      tags: tags || [],
      mood: mood || null,
      location: location || null,
      userId: req.session.userId,
      username: req.session.username,
    });
    await post.save();
    res.status(201).json({ post });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// DELETE post
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (post.userId !== req.session.userId)
      return res.status(403).json({ error: "Not authorized." });
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// LIKE / UNLIKE
router.patch("/:id/like", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    const uid = req.session.userId;
    const alreadyLiked = post.likedBy.includes(uid);
    if (alreadyLiked) {
      post.likedBy   = post.likedBy.filter((id) => id !== uid);
      post.reactions = Math.max(0, post.reactions - 1);
    } else {
      post.likedBy.push(uid);
      post.reactions += 1;
    }
    await post.save();
    res.json({ reactions: post.reactions, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// BOOKMARK / UNBOOKMARK
router.patch("/:id/bookmark", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    const uid = req.session.userId;
    const saved = post.bookmarks.includes(uid);
    if (saved) {
      post.bookmarks = post.bookmarks.filter((id) => id !== uid);
    } else {
      post.bookmarks.push(uid);
    }
    await post.save();
    res.json({ bookmarked: !saved });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ADD comment
router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });
    const comment = {
      userId:   req.session.userId,
      username: req.session.username,
      body:     req.body.body,
    };
    post.comments.push(comment);
    await post.save();
    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;
