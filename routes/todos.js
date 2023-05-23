const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');

// load helper


// load schema
require('../models/Todo');
require('../models/User');

const Todo = mongoose.model('todos');
const Users = mongoose.model('users');

// Todo Index Page
router.get('/', ensureAuthenticated, (req,res) => {
  Todo.find().sort({creationDate:'descending'}).then(todos => {
    val = todos.map(doc => doc.toObject());
    res.render('todos/index', {
      todos:val
    })
  }) // find something in DB
});



// add todo form
router.get('/add', ensureAuthenticated, (req,res) => {
  res.render('todos/add'); 
});

// edit todo form
router.get('/edit/:id', ensureAuthenticated, (req,res) => {
  Todo.findOne({
    _id: req.params.id
  }).then(todo => {
    Users.findById({_id:req.user.id}).then(current_user =>{
      if ((todo.user != req.user.id) && (current_user.role == "user")) {
        req.flash('error_msg', 'Not authorized');
        res.redirect('/todos');
      } else {
        val = todo.toObject()
        res.render('todos/edit', {
          todo: val
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
  if (!req.body.details) {
    errors.push({
      text: 'Please add some details'
    })
  }
  
  if (errors.length > 0) {
    res.render('todos/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details,
      dueDate: req.body.duedate
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id,
      dueDate: req.body.duedate
    };
    new Todo(newUser).save().then(todo => {
      req.flash('success_msg', 'Todo added');
      console.log(todo.id)
      res.redirect('/todos');
    })
  }
});

// edit form process
router.put('/:id', ensureAuthenticated, (req,res) => {
  Todo.findOne({
    _id: req.params.id
  }).then(todo => {
    Users.findById({_id:req.user.id}).then(current_user =>{
      if ((todo.user != req.user.id) && (current_user.role == "user")) {
        req.flash('error_msg', 'Not authorized');
        res.redirect('/todos');
      } else {
        // new values
        todo.title = req.body.title;
        todo.details = req.body.details;
        todo.dueDate = req.body.duedate;
        todo.update(todo).then( todo => {
          req.flash('success_msg', 'Todo updated');
          console.log(todo.id)
          res.redirect('/todos');
        });
      };
    });
  });
});

// delete Todo
router.delete('/:id', ensureAuthenticated, (req,res) => {
  Todo.findOne({
    _id: req.params.id
  }).then(todo => {
    Users.findById({_id:req.user.id}).then(current_user =>{
      if ((todo.user != req.user.id) && (current_user.role == "user")) {
        req.flash('error_msg', 'Not authorized');
        res.redirect('/todos');
      } else {
        Todo.remove({
          _id: req.params.id
        }).then(() => {
          req.flash('success_msg', 'Todo removed');
          res.redirect('/todos');
        })
      };
    });
  });
});



module.exports = router;
