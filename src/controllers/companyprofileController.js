require("dotenv").config();
const { User } = require("../models");

const getRecruiterProfile = async (req, res) => {
  try {
    console.log("User from middleware:", req.user);

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ error: "User not found or not authenticated" });
    }

    // Fetch user from DB
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'fullName',
        'email',
        'title',
        'companyName',
        'aboutUs',
        'profilepic',
        'bannerImage',
        'organizationType',
        'teamSize',
        'industryTypes',
        'yearOfEstablishment',
        'companyWebsite',
        'facebookLink',
        'instagramLink',
        'linkedInLink',
        'twitterLink',
        'location',
        'phoneNumber'
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build base URL for files
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      fullName: user.fullName,
      email: user.email,
      title: user.title,
      companyName: user.companyName,
      aboutUs: user.aboutUs,
      profilepic: user.profilepic
        ? `${baseUrl}/images/${user.profilepic}`
        : null,
      bannerImage: user.bannerImage 
      ? `${baseUrl}/images/${user.bannerImage}`
        : null,
      organizationType: user.organizationType,
      teamSize: user.teamSize,
      industryTypes: user.industryTypes,
      yearOfEstablishment: user.yearOfEstablishment,
      companyWebsite: user.companyWebsite,
      facebookLink: user.facebookLink,
      instagramLink: user.instagramLink,
      linkedInLink: user.linkedInLink,
      twitterLink: user.twitterLink,
      location: user.location,
      phoneNumber: user.phoneNumber,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: err.message });
  }
};

const updateRecruiterProfile = async (req, res) => {
  try {
    console.log("User from middleware:", req.user);

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ error: "User not found or not authenticated" });
    }

    // Fetch user from DB
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const allowedFields = [
        'fullName',
        'email',
        'title',
        'companyName',
        'aboutUs',
        'profilepic',
        'bannerImage',
        'organizationType',
        'teamSize',
        'industryTypes',
        'yearOfEstablishment',
        'companyWebsite',
        'facebookLink',
        'instagramLink',
        'linkedInLink',
        'twitterLink',
        'location',
        'phoneNumber'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      message: "Company Profile updated successfully",
      user: {
      fullName: user.fullName,
      email: user.email,
      title: user.title,
      companyName: user.companyName,
      aboutUs: user.aboutUs,
      profilepic: user.profilepic
        ? `${baseUrl}/images/${user.profilepic}`
        : null,
      bannerImage: user.bannerImage 
      ? `${baseUrl}/images/${user.bannerImage}`
        : null,
      organizationType: user.organizationType,
      teamSize: user.teamSize,
      industryTypes: user.industryTypes,
      yearOfEstablishment: user.yearOfEstablishment,
      companyWebsite: user.companyWebsite,
      facebookLink: user.facebookLink,
      instagramLink: user.instagramLink,
      linkedInLink: user.linkedInLink,
      twitterLink: user.twitterLink,
      location: user.location,
      phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error("Error updating Company profile:", err);
    res.status(500).json({ error: err.message });
  }
};




module.exports = { getRecruiterProfile, updateRecruiterProfile  };


// require('dotenv').config();
// const { User } = require("../models");

// const getUserProfile = async (req,res) =>{
//   try{
//         console.log("User from middleware:", req.user);

//     if (!req.user || !req.user.id) {
//       return res.status(400).json({ error: "User not found or not authenticated" });
//     }

//     const user = req.user;
//     res.json({
//       fullName : user.fullName,
//       username : user.username,
//       email : user.email,
//       title : user.title,
//       experience : user.experience,
//       education : user.education,
//       personalwebsite : user.personalwebsite,
//       profilepic : user.profilepic,
//       resume : user.resume,
//       location : user.location,
//       phoneNumber : user.phoneNumber,
//       bioGraphy : user.bioGraphy
//     });
//   }
//   catch(err){
//     res.status(500).json({error:err.message});
//   }
// };



// const updateUserProfile = async (req, res) => {
//   try {
//     console.log("User from middleware:", req.user);

//     if (!req.user || !req.user.id) {
//       return res
//         .status(400)
//         .json({ error: "User not found or not authenticated" });
//     }

//     // Fetch user from DB (Sequelize instance, not plain object)
//     const user = await User.findByPk(req.user.id);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const allowedFields = [
//       "fullName",
//       "title",
//       "email",
//       "experience",
//       "education",
//       "personalwebsite",
//       "location",
//       "phoneNumber",
//       "bioGraphy",
//     ];

//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         user[field] = req.body[field];
//       }
//     });

//     await user.save();

//     res.json({
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // const updateUserProfile = async (req, res) =>{
// //   try{
    
// //     console.log("User from middleware:", req.user);

// //     if (!req.user || !req.user.id) {
// //       return res.status(400).json({ error: "User not found or not authenticated" });
// //     }

// //     const user = req.user;

// //     const alloweFields= [ 'fullname','title','email','experience','education', 'personalwebsite', 'location', 'phoneNumber', 'bioGraphy'];
// //     alloweFields.forEach(field =>{
// //       if (req.body[field]!==undefined) user[field] = req.body[field];
// //     });

// //     await user.save();
// //     next();
// //     res.json({message: 'Profile updated successfully', user});
// //   }
// //   catch(err){
// //     res.status(500).json({error:err.message});
// //   }
// // };



// const updateAdminProfile = async (req, res) =>{
//   try {


    
//   } catch (err) {
    
//   }
// }

// module.exports = { getUserProfile, updateUserProfile, updateAdminProfile }























// const { User } = require('../models');


// const getRecruiterProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const recruiter = await User.findByPk(userId, {
//       attributes: [
//         'fullName',
//         'email',
//         'title',
//         'companyName',
//         'aboutUs',
//         'profilepic',
//         'bannerImage',
//         'organizationType',
//         'teamSize',
//         'industryTypes',
//         'yearOfEstablishment',
//         'companyWebsite',
//         'facebookLink',
//         'instagramLink',
//         'linkedInLink',
//         'twitterLink',
//         'location',
//         'phoneNumber'
//       ]
//     });

//     if (!recruiter || recruiter.role !== 'recruiter') {
//       return res.status(404).json({ error: 'Recruiter profile not found' });
//     }

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     // Build clean response without id
//     res.status(200).json({
//       fullName: recruiter.fullName,
//       email: recruiter.email,
//       title: recruiter.title,
//       companyName: recruiter.companyName,
//       aboutUs: recruiter.aboutUs,
//       profilepic: recruiter.profilepic
//         ? `${baseUrl}/images/${recruiter.profilepic}`
//         : null,
//       bannerImage: recruiter.bannerImage
//         ? `${baseUrl}/images/${recruiter.bannerImage}`
//         : null,
//       organizationType: recruiter.organizationType,
//       teamSize: recruiter.teamSize,
//       industryTypes: recruiter.industryTypes,
//       yearOfEstablishment: recruiter.yearOfEstablishment,
//       companyWebsite: recruiter.companyWebsite,
//       facebookLink: recruiter.facebookLink,
//       instagramLink: recruiter.instagramLink,
//       linkedInLink: recruiter.linkedInLink,
//       twitterLink: recruiter.twitterLink,
//       location: recruiter.location,
//       phoneNumber: recruiter.phoneNumber,
//     });
//   } catch (error) {
//     console.error('Error fetching recruiter profile:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Update recruiter profile
// const updateRecruiterProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const {
//       companyName,
//       aboutUs,
//       title,
//       profilePic,
//       bannerImage,
//       organizationType,
//       teamSize,
//       industryTypes,
//       yearOfEstablishment,
//       companyWebsite,
//       facebookLink,
//       instagramLink,
//       linkedInLink,
//       twitterLink,
//       location,
//       phoneNumber
//     } = req.body;

//     const recruiter = await User.findByPk(userId);

//     if (!recruiter || recruiter.role !== 'recruiter') {
//       return res.status(404).json({ error: 'Recruiter profile not found' });
//     }

//     await recruiter.update({
//       companyName,
//       aboutUs,
//       title,
//       profilePic,
//       bannerImage,
//       organizationType,
//       teamSize,
//       industryTypes,
//       yearOfEstablishment,
//       companyWebsite,
//       facebookLink,
//       instagramLink,
//       linkedInLink,
//       twitterLink,
//       location,
//       phoneNumber
//     });

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       recruiter: {
//         companyName: recruiter.companyName,
//         aboutUs: recruiter.aboutUs,
//         title: recruiter.title,
//         profilepic: recruiter.profilePic,
//         bannerImage: recruiter.bannerImage,
//         organizationType: recruiter.organizationType,
//         teamSize: recruiter.teamSize,
//         industryTypes: recruiter.industryTypes,
//         yearOfEstablishment: recruiter.yearOfEstablishment,
//         companyWebsite: recruiter.companyWebsite,
//         facebookLink: recruiter.facebookLink,
//         instagramLink: recruiter.instagramLink,
//         linkedInLink: recruiter.linkedInLink,
//         twitterLink: recruiter.twitterLink,
//         location: recruiter.location,
//         phoneNumber: recruiter.phoneNumber
//       }
//     });
//   } catch (err) {
//     console.error('Error updating recruiter profile:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = { getRecruiterProfile, updateRecruiterProfile };












// // const { User } = require('../models');
// // // i want that the response should look like this like in user profile response
// // // Get recruiter profile 
// // const getRecruiterProfile = async (req, res) => {
// //   try {
// //     const userId = req.user.id;

// //     const recruiter = await User.findByPk(userId, {
// //       attributes: [
// //         'id',
// //         'fullName',
// //         'email',
// //         'role',
// //         'companyName',
// //         'aboutUs',
// //         'profilepic',
// //         'bannerImage',
// //         'organizationType',
// //         'teamSize',
// //         'industryTypes',
// //         'yearOfEstablishment',
// //         'companyWebsite',
// //         'facebookLink',
// //         'instagramLink',
// //         'linkedInLink',
// //         'twitterLink',
// //         'location',
// //         'phoneNumber'
// //       ]
// //     });

// //     if (!recruiter || recruiter.role !== 'recruiter') {
// //       return res.status(404).json({ error: 'Recruiter profile not found' });
// //     }

// //     const baseUrl = `${req.protocol}://${req.get("host")}`;

// //     res.status(200).json({ recruiter:{
// //       ...recruiter.toJSON(),
// //       profilepic:recruiter.profilepic?`${baseUrl}/images/${recruiter.profilepic}`:null,
// //       bannerImage:recruiter.bannerImage?`${baseUrl}/images/${recruiter.bannerImage}`:null,
// //     } });
// //   } catch (error) {
// //     console.error('Error fetching recruiter profile:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // };

// // //  Update recruiter profile
// // const updateRecruiterProfile = async (req, res) => {
// //   try {
// //     const userId = req.user.id;

// //     const {
// //       companyName,
// //       aboutUs,
// //       profilePic,
// //       bannerImage,
// //       organizationType,
// //       teamSize,
// //       industryTypes,
// //       yearOfEstablishment,
// //       companyWebsite,
// //       facebookLink,
// //       instagramLink,
// //       linkedInLink,
// //       twitterLink,
// //       location,
// //       phoneNumber
// //     } = req.body;

    
// //     const recruiter = await User.findByPk(userId);

// //     if (!recruiter || recruiter.role !== 'recruiter') {
// //       return res.status(404).json({ error: 'Recruiter profile not found' });
// //     }

// //     await recruiter.update({
// //       companyName,
// //       aboutUs,
// //       profilePic,
// //       bannerImage,
// //       organizationType,
// //       teamSize,
// //       industryTypes,
// //       yearOfEstablishment,
// //       companyWebsite,
// //       facebookLink,
// //       instagramLink,
// //       linkedInLink,
// //       twitterLink,
// //       location,
// //       phoneNumber
// //     });

// //     res.status(200).json({ message: 'Profile update successfully', recruiter });
// //   } catch (err) {
// //     console.error('Error updating recruiter profile:', err);
// //     res.status(500).json({ error: 'Internal server error' });
// //   }
// // };

// // module.exports = { getRecruiterProfile, updateRecruiterProfile }