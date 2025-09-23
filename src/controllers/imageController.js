const { Image, User } = require("../models");
const { Op } = require("sequelize");

// ------Upload profile picture
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
   
    console.log(req.user)    

    const image = await Image.create({
      userId: req.user.id,
      filename: req.file.filename,
      filepath: `/public/Images/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
       console.log(image)
        await User.update(
          // { profilepic: req.file ? req.file.filename : null },
            { profilepic:req.file.filename },
      { where: { id: req.user.id } }
    );


    res.status(201).json({ message: "Profile picture uploaded successfully", image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -----Upload banner image
const uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
   
    console.log(req.user)    

    const image = await Image.create({
      userId: req.user.id,
      filename: req.file.filename,
      filepath: `/public/Images/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
       console.log(image)
        await User.update(
          { bannerImage: req.file ? req.file.filename : null },
      { where: { id: req.user.id } }
    );
    res.status(201).json({ message: "Banner Image  uploaded successfully", image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Upload resume (PDF only)
const uploadResumePdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    console.log(req.user)    

    const resume = await Image.create({
      userId: req.user.id,
      filename: req.file.filename,
      filepath: `/public/Resume/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

     await User.update(
      // { resume: resumeFile ? resumeFile.filename : null},
      { resume: req.file ? req.file.filename : null },
      // { resume: newResume.filepath },
      { where: { id: req.user.id } }
    );

    res.status(201).json({ message: "Resume uploaded successfully", resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { uploadProfilePic, uploadResumePdf, uploadBannerImage };

