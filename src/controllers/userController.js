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
const deleteUser = async(req,res)=>{

    try{
        const { id } = req.params
        if(!id){
        return res.status(400).json({ error: 'User ID required'});
        }
    
        const user = await User.findByPk(id);
        if (!user){
            return res.status(404).json({ error: 'User not found' });
        }
    
        await User.destroy({ where:{ id } });
        res.status(200).json({ message: 'User deleted Successfully' });
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
}

// Deactivate user
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.update({ status: "inactive" }, { where: { id } });
    res.json({ message: "User account deactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Reactivate user
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.update({ status: "active" }, { where: { id } });
    res.json({ message: "User account reactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Banned User
const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.update({ status: "banned" }, { where: { id } });
    res.json({ message: "User banned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete user (paranoid:true)
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id } }); // sets deletedAt
    res.json({ message: "User soft deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Restore soft-deleted user
const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.restore({ where: { id } }); // only works with paranoid:true
    res.json({ message: "User restored successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hard delete user (permanent)
const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.destroy({ where: { id }, force: true }); // bypass paranoid
    res.json({ message: "User permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { createUser, getUser, getUserById, updateUser, deleteUser, deactivateUser, reactivateUser, banUser ,softDeleteUser, restoreUser, hardDeleteUser}


// npx sequelize-cli model:generate --name Profile \
// --attributes profilePic:string,fullName:string,title:string,experience:text,education:text,personalWebsite:string,resume:string
