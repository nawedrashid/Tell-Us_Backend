const express = require("express");
const { Post } = require("../Model/postModel");
const router = express.Router();
const { User } = require("../Model/userModel");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dnjkwgmvv",
  api_key: "839597729259519",
  api_secret: "5EE_IBhy6QhMJX73l9V4NsOR__k",
  secure: true,
});


// Post Upload
router.route("/:userId/upload").post(async (req, res) => {
  try {
    const { userId } = req.params;
    const { postText } = req.body;
    const file = req?.files?.photo;
    let postContent = {
      postText: postText,
      author: userId,
      timeStamp: new Date(),
    };
    if (file) {
      await cloudinary.uploader.upload(
        file.tempFilePath,
        async (err, result) => {
          if (result) {
            postContent = {
              ...postContent,
              postImage: result.secure_url,
            };
          } else {
            console.log("Error occurred while uploading File");
            res.status(500).json({
              status: false,
              message: "image uploadation to cloudinary failed",
              errorDetail: err,
            });
          }
        }
      );
    }
    const newPost = new Post(postContent);
    const savedPost = await newPost.save();
    const addUserPost = await User.findById(userId);
    addUserPost.posts = addUserPost.posts.concat(savedPost);
    await addUserPost.save();
    return res.status(201).json({ success: "true", savedPost });
  } catch (error) {
    console.log(error);
  }
});


// Like Post
router.route("/:clientId/likedPost/:postId").post(async (req, res) => {
  try {
    const { clientId, postId } = req.params;
    const getPost = await Post.findById(postId);
    const checkAlreadyLiked = getPost.like.includes(clientId)
    const checkAlreadyDisliked = getPost.dislike.includes(clientId)
    if(checkAlreadyDisliked){
      getPost.dislike = getPost.dislike.filter((Id) => Id != clientId);
    }
    if(checkAlreadyLiked){
      getPost.like = getPost.like.filter((Id) => Id != clientId);
    }
    else{
      getPost.like = getPost.like.concat(clientId)
    }
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});


// Dislike Post
router.route("/:clientId/dislikedPost/:postId").post(async (req, res) => {
  try {
    const { clientId, postId } = req.params;
    const getPost = await Post.findById(postId);
    const checkAlreadyLiked = getPost.like.includes(clientId)
    const checkAlreadyDisliked = getPost.dislike.includes(clientId)
    if(checkAlreadyLiked){
      getPost.like = getPost.like.filter((Id) => Id != clientId);
    }
    if(checkAlreadyDisliked){
      getPost.dislike = getPost.dislike.filter((Id) => Id != clientId);
    }
    else{
      getPost.dislike = getPost.dislike.concat(clientId)
    }
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});


// Post Removal
router.route("/:userId/removePost/:postId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const getPost = await Post.findById(postId);
    const updateUserPost = await User.findById(userId)
    updateUserPost.posts = updateUserPost.posts.filter((post) => String(post) !== String(postId))
    await updateUserPost.save()
    const deletePost = await Post.findOneAndDelete(postId)
    const getUpdatePost = await Post.find({})
    if(getUpdatePost)
    return res.json({ success:true, getUpdatePost })
  } catch (error) {
    console.log(error);
  }
});


// Post Edit
router.route("/:userId/editPost/:postId").post(async (req, res) => {
  try {
    const { postId, userId } = req.params;
    const { postText } = req.body;
    const getUser = await User.findById(userId);
    const getPost = await Post.findById(postId);
    if (String(getPost.author) === userId) {
      getPost.postText = postText;
    }
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});


// Add Comment
router.route("/addComment/:postId/userId/:userId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { commentText } = req.body;
    const getPost = await Post.findById(postId);
    let defaultComment = {
      message: commentText,
      author: userId,
    };
    getPost.comments = getPost.comments.concat(defaultComment);
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

// Get Comments
router.route('/:postId/comments').get(async(req,res)=>{
  try{
    const {postId} = req.params
    const getPost = await Post.findById(postId).populate({
      path:"comments",
      populate:{
        path:"author"
      }
    })
    return res.json({success:true, getPost})
  }catch(error){
    console.log(error)
  }
})

// Delete Comment
router.route("/:postId/removeComment/:commentId")
  .post(async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const getPost = await Post.findOneAndUpdate(postId);
      getPost.comments = getPost.comments.filter(
        (comment) => String(comment._id) !== String(commentId)
      );
      await getPost.save();
      return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

router.route("/:postId/editComment/:commentId").post(async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { commentText } = req.body;
    const getPost = await Post.findOneAndUpdate(postId);
    getPost.comments = getPost.comments.map((comment) => {
      console.log(typeof comment._id, typeof commentId);
      if (String(comment._id) === String(commentId)) {
        comment.message = commentText;
      }
      return comment;
    });
    console.log(getPost.comments);
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

// Find User
router.route('/:searchUser').get(async(req,res) =>{
  try{
    const { searchUser } = req.params
    let response = await User.find({
      "$or": [
        { username: {$regex: searchUser} }
      ]
    })
    if(response){
      res.status(201).json({success:true, response})
    }
  }catch(error){
    console.log(error.message)
  }
})

// Unfollow User
router.route("/:userId/unfollow/:clientId").post(async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const getUser = await User.findById(userId);
    getUser.followings = getUser.followings.filter(
      (Id) => String(Id) !== String(clientId)
    );
    await getUser.save();
    const getUpdatedUser = await User.findById(userId).populate("followings")
    return res.json({ success: true, getUpdatedUser });
  } catch (error) {
    console.log(error);
  }
});


// Romove Follower
router.route("/:userId/removefollower/:clientId").post(async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const getUser = await User.findById(userId);
    getUser.followers = getUser.followers.filter(
      (Id) => String(Id) !== String(clientId)
    );
    await getUser.save();
    const getUpdatedUser = await User.findById(userId).populate("followers")
    return res.json({ success: true, getUpdatedUser });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
