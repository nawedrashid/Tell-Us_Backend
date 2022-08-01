const express = require("express");
const router = express.Router();
const { User } = require("../Model/userModel");
const bcrypt = require("bcryptjs");
const { userCheckHandler } = require("../Middleware/userCheckHandler");
const cloudinary = require("cloudinary").v2;


// Registering Users
router.route("/registration").post(userCheckHandler,async (req, res) => {
  const { name, username, email, password, bio } = req.body;
  const file = req?.files?.photo;
  try {
    let createUser = {
      name: name,
      username: username,
      email: email,
      password: password,
      bio: bio,
    };
    if (file) {
      await cloudinary.uploader.upload(
        file.tempFilePath,
        async (err, result) => {
          if (result) {
            createUser = {
              ...createUser,
              avatar: result.secure_url,
            };
          } else {
            console.log("Error occurred while uploading File");
            res.status(500).json({
              status: false,
              message: "avatar uploadation to cloudinary failed",
              errorDetail: err.message,
            });
          }
        }
      );
    }
    const newUser = new User(createUser)
    const user = await newUser.save();
    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, user });
    }
  } catch (error) {
    console.log(error);
  }
});


// Login Users
router.route("/login").post(async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkUser = await User.findOne({ email: email })
    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (checkPassword) {
      return res.json({ success: true, checkUser });
    } else {
      return res.json({ success: false, message: "Authentication Failed" });
    }
  } catch (error) {
    console.log(error);
  }
});


// Following Posts
router.route('/:userId/followingposts').get(async(req,res) =>{
  try{
    const {userId} = req.params
    getFollowingDetails = await User.findById(userId).populate({
      path:"followings",
      populate:{
        path:"posts",
        populate:{
          path:"author"
        }
      }
    })
    let allPosts = []
    const getPosts = getFollowingDetails.followings?.map((following) => {
      allPosts = [...allPosts,...following.posts]
      return following
    })
    res.json({success:true,allPosts})
  }catch(error){
    console.log(error)
  }
})

// Edit Profile
router.route('/editProfile/:userId').post(async(req,res)=>{
  try {
      const {userId} =  req.params
      const {name,username,bio} = req.body
      let newavatar = ""
      const file = req?.files?.photo
      if(file){
          await cloudinary.uploader.upload(file.tempFilePath,async(error,result)=>{
              if(result)
              {
                  newavatar=result.secure_url
              }
              else{
              console.log("error uploading photo")
              res.status(500).json({
                  status: false,
                  message: "Image uploadation to cloudinary failed",
                  errorDetail: err,
                });
              }
          })
      }
      let updateUser = await User.findByIdAndUpdate(userId,{
          $set:{
              name:name,
              bio:bio,
              username:username,
              avatar:newavatar
          }
      },{
          new: true
        })
      return res.json({success:true,updateUser})
  } catch (error) {
      console.log(error.message)
  }
})


// Following
router.route("/:userId/follow/:clientId").post(async (req, res) => {
  try {
    const { userId, clientId } = req.params;
    const secondUser = await User.findById(clientId);
    const activeUser = await User.findById(userId);
    activeUser.followings.push(clientId);
    secondUser.followers.push(userId);
    const updateActiveUser = await activeUser.save();
    await secondUser.save();

    if (updateActiveUser) {
      res.json({ success: true, updateActiveUser });
    } else {
      res.json({ success: false, updateActiveUser });
    }
  } catch (error) {
    console.log(error);
  }
});


// Getting followers and following details
router.route("/:userId").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const getDetails = await User.findById(userId)
      .populate("followings followers")
      .select("followings followers-_id");
    if (getDetails) {
      res.json({ success: true, getDetails });
    } else {
      res.json({ success: false, message: "cant retrieve data" });
    }
  } catch (error) {
    console.log(error);
  }
});


// Getting User Post details
router.route("/:userId/posts").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const getDetails = await User.findById(userId)
      .populate("posts")
      .select("posts -_id");
    if (getDetails) {
      res.json({ success: true, getDetails });
    } else {
      res.json({ success: false, message: "cant retrieve data" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.route("/unfollowed").get(async (req, res) => {
  try {
    const getUsers = await User.find()
    if (getUsers) {
      res.json({ success: true, getUsers });
    } else {
      res.json({ success: false, message: "cant retrieve data" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;