const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create schema
const PostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('post', PostSchema);