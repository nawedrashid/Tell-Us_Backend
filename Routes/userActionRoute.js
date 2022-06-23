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

router.route("/:clientId/likedPost/:postId").post(async (req, res) => {
  try {
    const { clientId, postId } = req.params;
    const getPost = await Post.findById(postId);
    getPost.like = getPost.like.concat(clientId);
    await getPost.save();
    const getUser = await User.findById(clientId);
    getUser.likedPosts = getUser.likedPosts.concat(postId);
    await getUser.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

router.route("/:clientId/dislikedPost/:postId").post(async (req, res) => {
  try {
    const { clientId, postId } = req.params;
    const getPost = await Post.findById(postId);
    getPost.dislike = getPost.dislike.concat(clientId);
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

router.route("/:userId/removePost/:postId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const getPost = await Post.findById(postId);
    Post.filter((post) => String(post._id) !== String(postId));
    const getUser = await User.findById(userId);
    getUser.posts = getUser.posts.filter(
      (eachpost) => String(eachpost._id) !== String(postId)
    );
    await Post.save();
    await getUser.save();
    return res.json({ success: true, getUser });
  } catch (error) {
    console.log(error);
  }
});

router.route("/editPost/:postId").post(async (req, res) => {
  try {
    const { postId } = req.params;
    const { postText } = req.body;
    const getPost = await Post.findById(postId);
    getPost.postText = postText;
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

router.route("/addComment/:postId/userId/:userId").post(async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const { commentText } = req.body;
    const getPost = await Post.findOneAndUpdate(postId);
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

router
  .route("/:postId/removeComment/:commentId") //delete comment
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
router
  .route("/:postId/editComment/:commentId")
  .post(async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const { commentText } = req.body;
      const getPost = await Post.findOneAndUpdate(postId);
      getPost.comments = getPost.comments.map((comment) => {
        console.log(typeof comment._id, typeof commentId)
        if (String(comment._id) === String(commentId)) {
          comment.message = commentText;
        }
        return comment;
      });
      console.log(getPost.comments)
      await getPost.save();
      return res.json({ success: true, getPost });
    } catch (error) {
      console.log(error);
    }
  });

router.route("/:clientId/undoLike/:postId").post(async (req, res) => {
  try {
    const { postId, clientId } = req.params;
    const getPost = await Post.findById(postId);
    getPost.like = getPost.like.filter(
      (like) => String(like) !== String(clientId)
    );
    const getUser = await User.findById(clientId);
    getUser.likedPosts = getUser.likedPosts.filter(
      (likedPost) => String(likedPost) !== String(postId)
    );
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

router.route("/:clientId/undoDislike/:postId").post(async (req, res) => {
  try {
    const { postId, clientId } = req.params;
    const getPost = await Post.findById(postId);
    getPost.dislike = getPost.dislike.filter(
      (dislike) => String(dislike) !== String(clientId)
    );
    await getPost.save();
    return res.json({ success: true, getPost });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
