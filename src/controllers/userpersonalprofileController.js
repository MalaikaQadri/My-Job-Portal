require('dotenv').config();
const { User } = require("../models");

const getUserProfile = async (req,res) =>{
  try{
        console.log("User from middleware:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User not found or not authenticated" });
    }

    const user = req.user;
    res.json({
      fullName : user.fullName,
      username : user.username,
      email : user.email,
      title : user.title,
      experience : user.experience,
      education : user.education,
      personalwebsite : user.personalwebsite,
      profilepic : user.profilepic,
      resume : user.resume,
      location : user.location,
      phoneNumber : user.phoneNumber,
      bioGraphy : user.bioGraphy
    });
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
};


const updateUserProfile = async (req, res) =>{
  try{
    
    console.log("User from middleware:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User not found or not authenticated" });
    }

    const user = req.user;

    const alloweFields= [ 'title','experience','education', 'personalwebsite', 'location', 'phoneNumber', 'bioGraphy'];
    alloweFields.forEach(field =>{
      if (req.body[field]!==undefined) user[field] = req.body[field];
    });

    await user.save();
    res.json({message: 'Profile updated successfully', user});
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
};



const updateAdminProfile = async (req, res) =>{
  try {


    
  } catch (err) {
    
  }
}

module.exports = { getUserProfile, updateUserProfile, updateAdminProfile }


