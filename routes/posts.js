const express = require('express');
const {
  getPosts,
  getPost,
  addPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment
} = require('../controllers/posts');

const Post = require('../models/Post');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');


// All routes in this file will use protect and authorize middleware

// Must be logged in to access this route
router.use(protect);

// Access is Authorize to these roles
// router.use(authorize('admin', 'user'));  

router
  .route("/")
    .get(advancedResults(Post), getPosts)
    .post(addPost);  
    
router
  .route('/:id')
  .get(getPost)
  .put(updatePost)   
  .delete(deletePost);    

router
  .route('/like/:id')
  .put(likePost);

router
  .route('/unlike/:id')
  .put(unlikePost)  

router
  .route('/comment/:id')
  .post(addComment) 
  
router
  .route('/comment/:id/:comment_id')
  .delete(deleteComment)  

module.exports = router;    