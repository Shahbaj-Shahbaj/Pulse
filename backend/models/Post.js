const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  username: { type: String, required: true },
  body:     { type: String, required: true, maxlength: 500 },
  createdAt:{ type: Date, default: Date.now },
});

const locationSchema = new mongoose.Schema({
  latitude:  { type: Number },
  longitude: { type: Number },
  name:      { type: String, maxlength: 200 },
});

const postSchema = new mongoose.Schema({
  title:     { type: String, required: true, maxlength: 120 },
  body:      { type: String, required: true, maxlength: 2000 },
  userId:    { type: String, required: true },
  username:  { type: String, required: true },
  tags:      { type: [String], default: [] },
  mood:      { type: String, default: null },
  location:  { type: locationSchema, default: null },
  reactions: { type: Number, default: 0 },
  likedBy:   { type: [String], default: [] },
  bookmarks: { type: [String], default: [] },
  comments:  { type: [commentSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
