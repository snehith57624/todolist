const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');
// const await = require('await')

// load schema
require('../models/Post');
require('../models/User');
require('../models/Comment');
// const CommentSchema = require('../models/Comment');

const Posts = mongoose.model('post');
// const Posts = mongoose.models.posts || mongoose.model('posts', postSchema);
const Users = mongoose.model('users');
const Comments = mongoose.model('comments');

// post Index Page
router.get('/', ensureAuthenticated, (req,res) => {
    Posts.find().sort({creationDate:'descending'}).then(async posts => {
        
        const val = await Promise.all(
            posts.map(async (post) => {
                const postObj = post.toObject();

                // Find comments for the current post
                const comments = await Comments.find({ postId: post._id });
                
                // Add comments to the post object
                postObj.comments = comments.map(commentOb => commentOb.toObject());
      
                return postObj;
            })
        );
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
  Posts.findOne({
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
      req.flash('success_msg', 'Post added');
      res.redirect('/posts');
    })
  }
});

// add comment form
router.get('/comment/:id', ensureAuthenticated, (req,res) => {
    res.render('comments/add',{
        id:req.params.id
    }); 
});

// add comment form
router.post('/comments/add/:id', ensureAuthenticated, (req,res) => {

    // do operations based on id inorder to get correct user name
    Users.findById({_id:req.user._id}).then(current_user =>{
        const newComment = {
            comment: req.body.title,
            user: req.user._id,
            postId: req.params.id,
            userName: current_user.name
        };

        new Comments(newComment).save().then(commentObj => {
            req.flash('success_msg', 'Comment added');
            res.redirect('/posts');
        })
    });
  });

// edit form process
router.put('/:id', ensureAuthenticated, (req,res) => {
    Posts.findOne({ _id: req.params.id })
    .then((post) => {
      Users.findById({ _id: req.user._id })
        .then((current_user) => {
          if(post.user != req.user._id && current_user.role == "user") {
            req.flash('error_msg', 'Not authorized');
            res.redirect('/posts');
          } else {
            // Update the post with new values
            post.title = req.body.title;
            post.user = req.user._id;

            post.save().then(() => {
                req.flash('success_msg', 'Post updated');
                res.redirect('/posts');
              })
              .catch((err) => {
                console.error(err);
                req.flash('error_msg', 'Error updating post');
                res.redirect('/posts');
              });
          }
        });
    })
    .catch((err) => {
      console.error(err);
      req.flash('error_msg', 'Error finding post');
      res.redirect('/posts');
    });
});

// delete Post
router.delete('/:id', ensureAuthenticated, (req,res) => {
    Posts.findOne({ _id: req.params.id }).then((post) => {
        Users.findById({ _id: req.user._id }).then((current_user) => {
          if (post.user != req.user._id && current_user.role == "user") {
            req.flash('error_msg', 'Not authorized');
            res.redirect('/posts');
          } else {
            Posts.remove({ _id: req.params.id }).then(() => {
              Comments.remove({ postId: req.params.id }).then(() => {
                req.flash('success_msg', 'Post removed');
                res.redirect('/posts');
              });
            });
          }
        });
    });
});



module.exports = router;
