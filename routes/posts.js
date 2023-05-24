const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');


// load schema
require('../models/Post');
require('../models/User');

const Posts = mongoose.model('posts');
const Users = mongoose.model('users');

// post Index Page
router.get('/', ensureAuthenticated, (req,res) => {
    Posts.find().sort({creationDate:'descending'}).then(posts => {
    val = posts.map(post => post.toObject());
    res.render('posts/index', {
      posts:val
    })
  })
});



// add post form
router.get('/add', ensureAuthenticated, (req,res) => {
  res.render('posts/add'); 
});

// edit post form
router.get('/edit/:id', ensureAuthenticated, (req,res) => {
  Todo.findOne({
    _id: req.params.id
  }).then(post => {
    Users.findById({_id:req.user.id}).then(current_user =>{
      if ((post.user != req.user.id) && (current_user.role == "user")) {
        req.flash('error_msg', 'Not authorized');
        res.redirect('/posts');
      } else {
        val = post.toObject()
        res.render('posts/edit', {
          post: val
        });
      };
    });
  });
});

// process  form
router.post('/', ensureAuthenticated, (req,res) => {
  let errors = [];
  
  if (!req.body.title) {
    errors.push({
      text: 'Please add title'
    })
  }
  
  if (errors.length > 0) {
    res.render('posts/add', {
      errors: errors,
      title: req.body.title,
    });
  } else {
    const newPost = {
      title: req.body.title,
      user: req.user.id,
    };
    new Posts(newPost).save().then(post => {
      req.flash('success_msg', 'Todo added');
      console.log(post.id)
      res.redirect('/posts');
    })
  }
});

// edit form process
router.put('/:id', ensureAuthenticated, (req,res) => {
  Todo.findOne({
    _id: req.params.id
  }).then(post => {
    Users.findById({_id:req.user.id}).then(current_user =>{
      if ((post.user != req.user.id) && (current_user.role == "user")) {
        req.flash('error_msg', 'Not authorized');
        res.redirect('/posts');
      } else {
        // new values
        post.title = req.body.title;
        Posts.save(post).then( post => {
          req.flash('success_msg', 'Todo updated');
          console.log(post.id)
          res.redirect('/posts');
        });
      };
    });
  });
});

// delete Todo
router.delete('/:id', ensureAuthenticated, (req,res) => {
  Todo.findOne({
    _id: req.params.id
  }).then(post => {
    Users.findById({_id:req.user.id}).then(current_user =>{
      if ((post.user != req.user.id) && (current_user.role == "user")) {
        req.flash('error_msg', 'Not authorized');
        res.redirect('/posts');
      } else {
        Todo.remove({
          _id: req.params.id
        }).then(() => {
          req.flash('success_msg', 'Todo removed');
          res.redirect('/posts');
        })
      };
    });
  });
});



module.exports = router;
