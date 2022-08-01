const { User } = require("../Model/userModel");


const userCheckHandler = async(req,res,next) => {
    try{
        const {email} = req.body;
        const checkUser = await User.findOne({email:email})
        if(checkUser)
            return res.json({success:false,message:"User Already Registered"})
        next()
    }
    catch (error){
        console.log(error.message)
    }
}

module.exports = {userCheckHandler}