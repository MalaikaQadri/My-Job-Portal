const { StructuredResume, User } = require('../models');


// CREATE resume
const createResume = async (req, res) => {
  try {
    const userId = req.user.id; 
    const {
      fullname, title, gender, degree, institute, experience,
      projects, location, phonenumber, email, personalwebsite,
      biography, skills
    } = req.body;

    if (!fullname || !title || !gender || !experience || !projects || 
        !phonenumber || !email || !biography || !skills) {
      return res.status(400).json({ 
        message: "All required fields must be filled" 
      });
    }

    const resume = await StructuredResume.create({
      userId,
      fullname,
      title,
      gender,
      degree,
      institute,
      experience,
      projects,
      location,
      phonenumber,
      email,
      personalwebsite,
      biography,
      skills
    });

    res.status(201).json({ message: "Resume created successfully", resume });
  } catch (error) {
    res.status(500).json({ message: "Error creating resume", error: error.message });
  }
};
// const createResume = async (req, res) => {
//   try {
  //     const { userId } = req.body; 
  //     const resume = await StructuredResume.create({
//       ...req.body,
//       userId
//     });
//     res.status(201).json({ message: 'Resume created successfully', resume });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating resume', error: error.message });
//   }
// };

// GET resume by userId
// const getResume = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const resume = await StructuredResume.findOne({ 
//       where: { userId },
//       include: [{ model: User, attributes: ['id','fullName','email'] }]
//     });

//     if (!resume) {
//       return res.status(404).json({ message: 'Resume not found' });
//     }
//     res.status(200).json(resume);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching resume', error: error.message });
//   }
// };






// GET resume
const getResume = async (req, res) => {
  try {
    const userId = req.user.id;  // use token user, not params

    const resume = await StructuredResume.findOne({ 
      where: { userId },
      include: [{ model: User, attributes: ['id','fullName','email'] }]
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resume', error: error.message });
  }
};

// UPDATE resume
const updateResume = async (req, res) => {
  try {
    const  userId  = req.user.id;

    const [updated] = await StructuredResume.update(req.body, {
      where: { userId }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const updatedResume = await StructuredResume.findOne({
       where: { userId },
       include:[{model:User,attributes:['id','fullName','email']}]
      });

    res.status(200).json({ message: 'Resume updated successfully', resume: updatedResume });
  } catch (error) {
    res.status(500).json({ message: 'Error updating resume', error: error.message });
  }
};

// DELETE resume
const deleteResume = async (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = await StructuredResume.destroy({
      where: { userId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resume', error: error.message });
  }
};

module.exports = { createResume ,getResume ,updateResume ,deleteResume }