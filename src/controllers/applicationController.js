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

// Recruiter ek specific applicant ki application detail dekh sake
const getJobApplicationDetail = async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;

    // Recruiter ke posted job check karo
    const job = await Job.findOne({ 
      where: { id: jobId, postedBy: req.user.id } 
    });

    if (!job) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }

    // Specific applicant ki application fetch karo
    const application = await Application.findOne({
      where: { jobId, userId: applicationId },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: [
            "id", "fullName", "email", "title", "experience", 
            "education", "personalwebsite", "profilepic", 
            "resume", "location", "phoneNumber"
          ]
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found for this applicant' });
    }
      
    // const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      success: true,
      jobId,
      applicant: {
        id: application.applicant.id,
        fullName: application.applicant.fullName,
        email: application.applicant.email,
        title: application.applicant.title,
        experience: application.applicant.experience,
        education: application.applicant.education,
        personalwebsite: application.applicant.personalwebsite,
        // profilepic: application.profilepic
        //   ? `${baseUrl}/images/${application.profilepic}`
        //   : null,
        // resume: application.resume
        //  ? `${baseUrl}/resume/${application.resume}` 
        //  : null,
        profilepic: application.applicant.profilepic,
        resume: application.applicant.resume,
        location: application.applicant.location,
        phoneNumber: application.applicant.phoneNumber,
        coverLetter: application.coverLetter,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });
  } catch (err) {
    console.error("Error fetching specific job application:", err);
    return res.status(500).json({ error: err.message });
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



const getJobApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    const role = req.user?.role;
    const { jobId } = req.params;

    if (!recruiterId || role !== "recruiter") {
      return res.status(401).json({ error: "Unauthorized: Only recruiters can view applications" });
    }

    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Fetch applications with applicant details jab 
    const applications = await Application.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: "applicant", 
          attributes: ["id", "fullName", "profilepic", "title", "experience", "education"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const applicantCards = applications.map((app) => ({
      id: app.applicant.id,
      fullName: app.applicant.fullName,
      title: app.applicant.title,
      experience: app.applicant.experience,
      education: app.applicant.education,
      profilepic: app.applicant.profilepic
        ? `${baseUrl}/images/${app.applicant.profilepic}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      jobId,
      applicants: applicantCards,
    });
  } catch (err) {
    console.error("Error fetching job applications for recruiter:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ui may jab recruiter my jobs ka page open kary ga tu uss ko jobs nazar aen gi , phir vo aik specific job ki applications open kary ga tu uss k pass cards showw hon gay jis may applicants ki thuri detail show hoo rahi hoo gi like image or name or title, jis ka controlleer getJobApplicationsForRecruiter hy jis ka code tumahy neechy send kar dia hy ab may ya chahti hoon jab recruiyter specific applicant ki application open karna chahy tu uss k pass just ussi ka cover letterr or baki ki detail show hoo magar controller may masla hy vo sari complete applications shooww kar raha hy halan k mujhy just specific ki chahiya uss ka controoler getJobApplications hy may nay dono controllers ka code send kar dia hy or user model or job model or application model ka bhi send kar rahi hoon mujhy ussy theek kar k doo 




module.exports = { getMyApplications, updateApplicationStatus, getJobApplications, applyJob, getJobApplicationsForRecruiter, getJobApplicationDetail }













