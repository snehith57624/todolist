const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const CommentSchema = new Schema({
  comment: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('posts', CommentSchema);