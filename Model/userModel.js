const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const {Schema, model} = mongoose;


const userSchema = new Schema({
    name:{
        type: String,
        required:true
    },
    username:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    avatar:{
        type: String,
    },
    posts:[{
        type: mongoose.Schema.Types.ObjectId, ref:"Post"
    }],
    followers:[{
        type: mongoose.Schema.Types.ObjectId,ref:"User",
    }],
    followings:[{
        type: mongoose.Schema.Types.ObjectId,ref:"User",
    }],
    likedPosts:[{
        type: mongoose.Schema.Types.ObjectId, ref:"Post"
    }],
    notifications:[{
        type: mongoose.Schema.Types.ObjectId,ref:"User",
    }],
    bio:{
        type: String,
        required:true
    },
    // timestamp:{
    //     createdAt : 'created_at',
    //     updatedAt : 'updated_at'
    // }
})


userSchema.pre('save', async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,12)
    }
    next()
})

const User = model('User', userSchema)

module.exports = {User}