const express = require("express");
const router = express.Router();
const { User } = require("../Model/userModel");
const bcrypt = require("bcryptjs");
const cloudinary = require("cloudinary").v2;

router.route("/registration").post(async (req, res) => {
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
      console.log("file hai")
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

router.route("/login").post(async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkUser = await User.find({ email: email });
    const checkPassword = bcrypt.compare(checkUser.password, password);
    if (checkPassword) {
      return res.json({ success: true, checkUser });
    } else {
      return res.json({ success: false, message: "Authentication Failed" });
    }
  } catch (error) {
    console.log(error);
  }
});

router.route("/:userId/follow/:followId").post(async (req, res) => {
  try {
    const { userId, followId } = req.params;
    const secondUser = await User.findById(followId);
    const activeUser = await User.findById(userId);
    activeUser.followings.concat(followId);
    secondUser.followers.concat(userId);
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

router.route("/:userId").get(async (req, res) => {
  try {
    const { userId } = req.params;
    const getDetails = await User.findById(userId)
      .populate("followings followers")
      .select("following followers-_id");
    if (getDetails) {
      res.json({ success: true, getDetails });
    } else {
      res.json({ success: false, message: "cant retrieve data" });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
