const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const commentSchema = new Schema({
    message:{
        type:String
    },
    timeStamp: {
        type: Date,
    },
    like:{
        type: Number
    },
    dislike:{
        type: Number
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
    },
},{
    timestamps: true,
})

const PostSchema = new Schema({
  postImage: {
    type: String,
  },
  postText: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  like: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dislike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [commentSchema],
  timeStamp: {
    type: Date,
  },
});



const Post = model('Post',PostSchema)

module.exports = { Post }
