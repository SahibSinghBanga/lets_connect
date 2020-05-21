const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Post = require('../models/Post');

/** 
 * @desc    Get All Posts  
 * @route   GET /api/v1/posts
 * @access  Private
**/
exports.getPosts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

/** 
 * @desc    Get Single Post By post_id  
 * @route   GET /api/v1/posts/:id
 * @access  Private
**/
exports.getPost = asyncHandler(async (req, res, next) => {
    
    const post = await Post.findById(req.params.id);

    if(!post) {
        return next(new ErrorResponse(`Post not found with the id ${req.params.id}`, 400));
    }

    res.status(200).json({ 
        success: true,
        data: post
    });
});

/** 
 * @desc    Add a post 
 * @route   POST /api/v1/posts
 * @access  Private
**/
exports.addPost = asyncHandler(async (req, res, next) => {

    // Add user to body
    req.body.user = req.user.id;
    
    // Saving the post
    const post = await Post.create(req.body);

    res.status(201).json({
        success: true,
        data: post
    });
});

/** 
 * @desc    Update a post By post_id
 * @route   PUT /api/v1/posts/:id
 * @access  Private
**/
exports.updatePost = asyncHandler(async (req, res, next) => {
    
    // Check for valid post_id
    let post = await Post.findById(req.params.id);

    if(!post) {
        return next(new ErrorResponse(`Post not found with the id of ${req.params.id}`, 404));
    }

    // Making sure the logged in user is post owner or a user with role admin
    if(post.user.toString() !== req.user.id && req.user.role !== 'admin') {

        return next(new ErrorResponse(`User ${req.params.id} is not authorized to edit this post`, 401));
    }

    await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ 
        success: true, 
        data: post 
    });

});

/** 
 * @desc    Delete a post By post_id
 * @route   DELETE /api/v1/posts/:id
 * @access  Private
**/
exports.deletePost = asyncHandler(async (req, res, next) => {
    
    // Check for valid post_id
    let post = await Post.findById(req.params.id);

    if(!post) {
        return next(new ErrorResponse(`Post not found with the id of ${req.params.id}`, 404));
    }

    // Making sure the logged in user is post owner or a user with role admin
    if(post.user.toString() !== req.user.id && req.user.role !== 'admin') {

        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this post`, 401));
    }

    await Post.findByIdAndRemove(req.params.id);

    res.status(200).json({ 
        success: true, 
        data: {} 
    });

});

/** 
 * @desc    Like a post, :id is post_id
 * @route   PUT api/posts/like/:id
 * @access  Private
**/
exports.likePost = asyncHandler(async (req, res, next) => {
    
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by this same user
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        return next(new ErrorResponse(`You have already liked this post`, 400));
    }

    // Else add the like to the post
    post.likes.unshift({ user: req.user.id });

    // Save the post with current like
    await post.save();

    res.json({
        success: true,
        data: post.likes
    });

});

/** 
 * @desc    Undo Like a post, :id is post_id
 * @route   PUT api/posts/unlike/:id
 * @access  Private
**/
exports.unlikePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    // Check if the post has liked, if not not throw error
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
        return next(new ErrorResponse(`This post is not yet been like by you `, 400));
    }

    // Get remove index for the undo like feature, you can't unlike a post just undo your like
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    // Remove the like
    post.likes.splice(removeIndex, 1);

    // Save the post with current like
    await post.save();

    res.json({
        success: true,
        data: post.likes
    });
});

/** 
 * @desc    Add Comment on a Post, :id is post_id 
 * @route   POST api/posts/comment/:id
 * @access  Private
**/
exports.addComment = asyncHandler(async (req, res, next) => {
    
    // Add user to body
    req.body.user = req.user.id;

    // Valid post or not
    const post = await Post.findById(req.params.id);

    if(!post) {
        return next(new ErrorResponse(`Post not found with the id of ${req.params.id}`, 404));
    }

    // Adding comment to post
    post.comments.unshift(req.body);

    await post.save();

    res.json({
        success: true,
        data: post.comments
    });

});

/** 
 * @desc    Delete Comment, :id is post_id and comment_id
 * @route   DELETE api/posts/comment/:id/:comment_id
 * @access  Private
**/
exports.deleteComment = asyncHandler(async (req, res, next) => {
    
    const post = await Post.findById(req.params.id);

    if(!post) {
        return next(new ErrorResponse(`Post not found with the id of ${req.params.id}`, 404));
    }

    // Pull out comment that needs to be deleted
    // .find will give us either a comment or false, remember that
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    // Make sure comment exists
    if(!comment) {
        return next(new ErrorResponse(`Comment does not exist`, 404));
    }

    // Check if user is owner of the comment or an admin
    if(comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`You are not authorized to perform this action`, 401));
    }

    // Get remove index
    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

    // Remove the comment
    post.comments.splice(removeIndex, 1);

    // Save the post with current like
    await post.save();

    res.json(post.comments);
});