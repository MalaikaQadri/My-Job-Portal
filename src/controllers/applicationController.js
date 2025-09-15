const { where } = require('sequelize');
const { Application, Job, User } = require('../models');

// Apply Job
const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user.id; // authenticated applicant

    // check job exists
    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if(!job.status === "expired" || new Date(job.jobExpirationDate) < new Date()){
      return res.status(400).json({error: 'This job has expired. You cannot apply'});
    }

    // prevent duplicate application
    const existing = await Application.findOne({ where: { userId, jobId } });
    if (existing) return res.status(400).json({ message: "Already applied" });

    const application = await Application.create({
      userId,
      jobId,
      coverLetter
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get job Applications ( recruiter only  )
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ where:{id:jobId, postedBy: req.user.id} });
    if(!job) return res.status(403).json({message: 'Not authorized to view applications for this job'});


    const applications = await Application.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "fullName", "email" , "title", "experience", "education", "personalwebsite" , "profilepic", "resume", "location", "phoneNumber"]
        }
      ]
    });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





// Update Application Status 
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; 
    const recruiterId = req.user.id; 

    const application = await Application.findByPk(applicationId, {
      include: {
        model: Job,
        as: 'job',
        attributes: ['id', 'title', 'postedBy'] 
      }
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    
    if (application.job.postedBy !== recruiterId) {
      return res.status(403).json({ error: "You are not allowed to update this application" });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: "Status updated", application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =================
// const updateAppplicationStatus = async (req, res) => {
//   try {
//     const { applicationId } = req.params;
//     const { status } = req.body; // 'shortlisted', 'rejected'

//     const application = await Application.findByPk(applicationId);
//     if (!application) return res.status(404).json({ message: "Application not found" });

//     if(application.job.postedBy !== req.user.id){
//         return res.status(403).json({message: 'Not authorized to update this application'});
//     }

//     application.status = status;
//     await application.save();

//     res.status(200).json({ message: "Status updated", application });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };





//  Get my  appplications ( applicant only  )
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(  )

    const applications = await Application.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "location", "jobType", "salaryMin", "salaryMax"]
        }
      ]
    });

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



module.exports = { getMyApplications, updateApplicationStatus, getJobApplications, applyJob }













