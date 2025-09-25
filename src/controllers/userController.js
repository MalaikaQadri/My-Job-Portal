const {Op} = require('sequelize');
const { where } = require('sequelize');
const bcrypt = require('bcrypt')
const { User } = require('../models');

//CREATE
const createUser = async (req, res) => {
    try {
    const { fullName, username, email, password, role } =req.body;

    if (!fullName || !username || !email || !password || !role){
        return res.status(400).json({ error : 'All fields are required'})
    }
    const existingUser = await User.findOne({ where: {email}});
    if(existingUser){
        return res.status(409).json({  error: 'Email ALready Exists'})
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        fullName, username, email, password: hashedPassword, role, isEmailVerified: false, is2FAEnabled: false,createdAt: new Date(),updatedAt: new Date()
    });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json({ message: 'User Created', user:userData });
    } 
    catch (error) {
        res.status(500).json({ error: error.message });
        
    }
};

const getApplicantProfileById = async (req, res) => {
  try {
    // Ensure requester is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Only recruiters can access applicant profiles (as requested).
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ success: false, message: "Access denied. Recruiter role required." });
    }

    const applicantId = req.params.id;
    if (!applicantId) {
      return res.status(400).json({ success: false, message: "Applicant id is required in params." });
    }

    // Fetch the applicant by primary key.
    const user = await User.findByPk(applicantId, {
      attributes: [
        "id",
        "fullName",
        "username",
        "email",
        "title",
        "experience",
        "education",
        "personalwebsite",
        "profilepic",
        "resume",
        "location",
        "phoneNumber",
        "bioGraphy",
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Applicant not found." });
    }

    // Make sure the target user is actually an applicant
    if (user.role && user.role !== "applicant") {
      return res.status(400).json({ success: false, message: "The requested user is not an applicant." });
    }

    // Build base URL for files
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Respond with same shape as getUserProfile (so UI shows identical view)
    return res.status(200).json({
      success: true,
      applicant: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        title: user.title,
        experience: user.experience,
        education: user.education,
        personalwebsite: user.personalwebsite,
        profilepic: user.profilepic ? `${baseUrl}/images/${user.profilepic}` : null,
        resume: user.resume ? `${baseUrl}/resume/${user.resume}` : null,
        location: user.location,
        phoneNumber: user.phoneNumber,
        bioGraphy: user.bioGraphy,
      },
    });
  } catch (err) {
    console.error("Error fetching applicant profile by id:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};



// All applicants  
const getAllApplicants = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const applicants = await User.findAll({
      where: { role: "applicant" },
      attributes: ["id", "fullName", "title", "profilepic"]
    });

    const formattedApplicants = applicants.map(applicant => ({
      id: applicant.id,
      name: applicant.fullName,
      title: applicant.title,
      profilepic: applicant.profilepic
        ? `${baseUrl}/images/${applicant.profilepic}`
        : null
    }));

    return res.status(200).json({
      success: true,
      applicants: formattedApplicants
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching applicants."
    });
  }
};


 


//Read ( Get All Users )
const getUser = async (req,res) =>{
    console.log(User); 
try {
    const users = await User.findAll({
        attributes: { exclude: ['password'] } 
    });
    res.status(200).json(users);
} catch (error) {
    res.status(500).json({ error: error.message });
}
}

// READ (Get User by ID)
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if id is provided and is a number
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Valid user ID is required' });
        }
        // Find user by primary key (ID)
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// UPDATE user
const updateUser = async (req, res)=>{
    try{
    const { id } = req.params;
    const { fullName, username, email, role} = req.body;
    // Check if atleast one field is provided
    if ( !fullName && !username && !email && !role ){
        return res.status(409).json({
            error: 'At least one field must be provided to update'
        })
    }
    // Check if email is already exits
    if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.id != id) {
        return res.status(409).json({ error: 'Email already in use by another user' });
    }
    }
    // Build fields to update dynamically 
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    const [updated] = await User.update(updateFields, { where: { id } });
    if (updated){
        const updatedUser = await User.findByPk(id,{
            attributes: { exclude: ['password'] }
        })
        res.status(200).json({
            message: 'User Updated Succesfully', user:updatedUser
        });
    }
    else{
        res.status(404).json({ error: 'User Not found' })
    }
}
catch(error){
    res.status(500).json({error: error.message})
}
};




// DELETE USER 
// const deleteUser = async(req,res)=>{

//     try{
//         const { id } = req.params
//         if(!id){
//         return res.status(400).json({ error: 'User ID required'});
//         }
    
//         const user = await User.findByPk(id);
//         if (!user){
//             return res.status(404).json({ error: 'User not found' });
//         }
    
//         await User.destroy({ where:{ id } });
//         res.status(200).json({ message: 'User deleted Successfully' });
//     }
//     catch(error){
//         res.status(500).json({error: error.message})
//     }
// }

// Deactivate user
// const deactivateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.update({ status: "inactive" }, { where: { id } });
//     res.json({ message: "User account deactivated successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// Reactivate user
// const reactivateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.update({ status: "active" }, { where: { id } });
//     res.json({ message: "User account reactivated successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Banned User
// const banUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.update({ status: "banned" }, { where: { id } });
//     res.json({ message: "User banned successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Soft delete user (paranoid:true)
// const softDeleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.destroy({ where: { id } }); // sets deletedAt
//     res.json({ message: "User soft deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Restore soft-deleted user
// const restoreUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.restore({ where: { id } }); // only works with paranoid:true
//     res.json({ message: "User restored successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Hard delete user (permanent)
// const hardDeleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await User.destroy({ where: { id }, force: true }); // bypass paranoid
//     res.json({ message: "User permanently deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id; // user authenticated from middleware
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. User not found." });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required." });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};




// =========
const getUserAccount = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "fullName", "email", "phoneNumber", "status"],
      paranoid:false
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Manage Users on Admin side 
const getallManageUsers = async (req, res) => {
  try {
    console.log("Inside Get All manage Users");
    const {role: roleParam} = req.query;
    console.log("Query role param:", roleParam);

    let whereClause = {};
    if(roleParam){
      whereClause.role = {[Op.eq]:roleParam};
    }
    console.log("Where Clause:", whereClause);

    const users = await User.findAll({
      attributes: ["id","fullName", "email", "phoneNumber", "role"],
      where:whereClause,
      paranoid:false,
    });

    console.log("Users Found", users.length);
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Manage user with "type"
const manageUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; 

    let message = "";

    switch (type) {
      case "active":
        await User.update({ status: "active" }, { where: { id } });
        message = "User activated successfully";
        break;

      case "inactive":
        await User.update({ status: "inactive" }, { where: { id } });
        message = "User deactivated successfully";
        break;

      case "banned":
        await User.update({ status: "banned" }, { where: { id } });
        message = "User banned successfully";
        break;

      case "softDelete":
        await User.destroy({ where: { id } }); 
        message = "User soft deleted successfully";
        break;

      case "ban":
        await User.restore({ where: { id } });
        message = "User report successfully";
        break;

      case "hardDelete":
        await User.destroy({ where: { id }, force: true });
        message = "User permanently deleted";
        break;

      default:
        return res.status(400).json({ error: "Invalid type" });
    }
    const updateUser = await User.findByPk(id, {paranoid:false});

    res.json({ message,user:updateUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser,changePassword, getUser, getUserById, updateUser, getallManageUsers, manageUserStatus, getUserAccount, getAllApplicants, getApplicantProfileById  }


