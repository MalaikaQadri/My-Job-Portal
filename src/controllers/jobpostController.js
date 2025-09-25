const {User, Job,Application, Sequelize } = require('../models');
const { Op } = Sequelize;
const { validationResult } = require('express-validator');

// Create Job 
const createJob = async (req, res) => {
  try {
    console.log("req.body:", req.body);
console.log("req.user:", req.user);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      tags,
      education,
      jobType,
      experience,
      jobExpirationDate,
      salaryMin,
      salaryMax,
      description,
      responsibilities,
      industryId,
    } = req.body;

    // Convert tags from string -> array
    let jobTags = tags;
    if (typeof tags === "string") {
      jobTags = tags.split(",").map(tag => tag.trim());
    }

    // Convert numeric fields safely
    const parsedExperience = parseInt(experience);
    const parsedSalaryMin = parseInt(salaryMin);
    const parsedSalaryMax = parseInt(salaryMax);

    //  Validations
    if (!title) return res.status(400).json({ error: 'Job title is required' });

    if (!jobTags || !Array.isArray(jobTags) || jobTags.length === 0)
      return res.status(400).json({ error: 'At least one tag is required' });

    if (!education) return res.status(400).json({ error: 'Education is required' });

    if (!jobType || !['fulltime', 'parttime', 'internship', 'remote', 'temporary'].includes(jobType))
      return res.status(400).json({ error: 'Invalid job type' });

    if (isNaN(parsedExperience) || parsedExperience < 0)
      return res.status(400).json({ error: 'Experience must be a valid number' });

    if (!jobExpirationDate || isNaN(Date.parse(jobExpirationDate)))
      return res.status(400).json({ error: 'Job expiration date must be a valid date' });

    if (isNaN(parsedSalaryMin) || parsedSalaryMin < 0)
      return res.status(400).json({ error: 'Minimum salary must be a valid number' });

    if (isNaN(parsedSalaryMax) || parsedSalaryMax < 0)
      return res.status(400).json({ error: 'Maximum salary must be a valid number' });

    if (parsedSalaryMax < parsedSalaryMin)
      return res.status(400).json({ error: 'Max salary must be greater than min salary' });

    if (!description) return res.status(400).json({ error: 'Description is required' });

    if (!responsibilities) return res.status(400).json({ error: 'Responsibilities are required' });

    if (!industryId || isNaN(industryId))
      return res.status(400).json({ error: 'Industry ID is required' });

    //  Check user from token
    const postedBy = req.user?.id;
    if (!postedBy) {
      return res.status(401).json({ error: 'Unauthorized: No user found on token' });
    }

    // job status 
    const jobStatus = new Date(jobExpirationDate) < new Date ()? "expired"  : "active";

    // Save job 
    const job = await Job.create({
      title,
      tags: jobTags,
      education,
      jobType,
      experience: parsedExperience,
      jobExpirationDate,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      description,
      responsibilities,
      industryId,
      postedBy:req.user.id,
      status: jobStatus
    });

    return res.status(201).json({ message: 'Job created successfully', job });

  } catch (error) {
    console.error(" CreateJob error:", error);
    return res.status(500).json({ error: 'Server error' });
  }
};


// Get All Jobs
const getallJobswithfulldetail = async (req, res) => {
  try {
    let {  page, limit } = req.query;

    page = parseInt(page) ||1;
    limit= parseInt(limit) || 10;

    const offset = (page -1) *limit;
    const {rows:jobs, count:totalJobs } = await Job.findAndCountAll({
      limit, offset, order:[["createdAt", "DESC"]],
    })

    return res.status(200).json({
      success: true,
      totalJobs,
      currentPage:page,
      totalPages:Math.ceil(totalJobs/limit),
      jobs
    });
  } catch (err) {
    console.error("Error Fetching Jobs:",err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// JAB YA sab get all job ka code hay is may mujhy profile pic ka url bhio chahiya taa k vo get hoo k show ho front end par .or may tumhay aik reference vala bhi send karon gi k kaysay baki API'S may lagaya hy uss k hisab say lagana 
//  Get jobs (list view)
const getJobs = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const offset = (page - 1) * limit;

    const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
      attributes: [
        "id",
        "title",
        "location",
        "salaryMin",
        "salaryMax",
        "jobExpirationDate",
        "status",
        "jobType",
        "createdAt"
      ],
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: ["companyName", "profilepic"], 
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      jobs,
    });
  } catch (err) {
    console.error("Error Fetching Jobs:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getTTTTJobs = async (req, res) => {
  try {
    let { page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const offset = (page - 1) * limit;

    const { rows: jobs, count: totalJobs } = await Job.findAndCountAll({
      attributes: [
        "id",
        "title",
        "location",
        "salaryMin",
        "salaryMax",
        "jobExpirationDate",
        "status",
        "jobType",
        "createdAt"
      ],
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: ["companyName", "profilepic"], 
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      jobs,
    });
  } catch (err) {
    console.error("Error Fetching Jobs:", err);
    return res.status(500).json({ error: "Server error" });
  }
};




// Get job details (full info when card is clicked)
const getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: [
            "companyName",
            "aboutUs",
            "profilepic",
            "bannerImage",
            "organizationType",
            "teamSize",
            "industryTypes",
            "yearOfEstablishment",
            "companyWebsite",
            "facebookLink",
            "instagramLink",
            "linkedInLink",
            "twitterLink",
            "location",
            "phoneNumber",
            "email",
          ],
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const jobDetail = {
      id: job.id,
      title: job.title,
      tags: job.tags,
      education: job.education,
      jobType: job.jobType,
      experience: job.experience,
      jobExpirationDate: job.jobExpirationDate,
      salaryRange: `${job.salaryMin} - ${job.salaryMax}`,
      description: job.description,
      responsibilities: job.responsibilities,
      status: job.status,
      createdAt: job.createdAt,

      // Recruiter / Company info
      company: {
        companyName: job.recruiter?.companyName,
        aboutUs: job.recruiter?.aboutUs,
        profilepic: job.recruiter?.profilepic
          ? `${baseUrl}/images/${job.recruiter.profilepic}`
          : null,
        bannerImage: job.recruiter?.bannerImage
          ? `${baseUrl}/images/${job.recruiter.bannerImage}`
          : null,
        organizationType: job.recruiter?.organizationType,
        teamSize: job.recruiter?.teamSize,
        industryTypes: job.recruiter?.industryTypes,
        yearOfEstablishment: job.recruiter?.yearOfEstablishment,
        companyWebsite: job.recruiter?.companyWebsite,
        facebookLink: job.recruiter?.facebookLink,
        instagramLink: job.recruiter?.instagramLink,
        linkedInLink: job.recruiter?.linkedInLink,
        twitterLink: job.recruiter?.twitterLink,
        location: job.recruiter?.location,
        phoneNumber: job.recruiter?.phoneNumber,
        email: job.recruiter?.email,  
      },
    };

    return res.status(200).json({
      success: true,
      job: jobDetail,
    });
  } catch (err) {
    console.error("Error Fetching Job Details:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getRecruiterJobs = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    const role = req.user?.role;

    if (!recruiterId || role !== "recruiter") {
      return res.status(401).json({ error: "Unauthorized: Only recruiters can view this" });
    }

    const jobs = await Job.findAll({
      where: { postedBy: recruiterId },
      attributes: ["id", "title", "jobExpirationDate", "jobType", "status", "createdAt"],
      include: [
        {
          model: Application,
          as: "applications",
          attributes: ["id"], 
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const jobCards = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      jobExpirationDate: job.jobExpirationDate,
      jobType: job.jobType,
      status: job.status,
      applicationsCount: job.applications?.length || 0,
    }));

    return res.status(200).json({
      success: true,
      jobs: jobCards,
    });
  } catch (err) {
    console.error("Error fetching recruiter jobs:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


// View applications for a specific job
const getJobApplications = async (req, res) => {
  try {
    const recruiterId = req.user?.id;
    const { jobId } = req.params;

    if (!recruiterId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Ensure the job belongs to this recruiter
    const job = await Job.findOne({
      where: { id: jobId, postedBy: recruiterId },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    // Fetch applications with applicant info
    const applications = await Application.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: "applicant", // make sure Application model has this association
          attributes: ["id", "fullName", "email", "profilepic", "resume"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      jobId,
      applications,
    });
  } catch (err) {
    console.error("Error fetching job applications:", err);
    return res.status(500).json({ error: "Server error" });
  }
};



// Get Single Job by ID  
const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    return res.json(job);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Update Job
const updateJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    await job.update(req.body);
    return res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// ai model may resume k keywords store store karwany hain database may then uss ki base par   job k sath resume ka match score show karwaey ga . resume k keywords store karwany k liya seperate model nanny ga ?? or hum score match bhi databse may store karwaen gay ?? or same model may ??? 

// Delete Job
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    await job.destroy();
    return res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// expire job 
const expireJobs = async (req, res) => {
  try {
    const [updatedCount] = await Job.update(
      { status: "expired" },
      { where: { jobExpirationDate: { [Op.lt]: new Date() }, status: "active" } }
    );

    return res.json({ message: "Job has Expired", count: updatedCount });
  } catch (error) {
    console.error("expireJobs error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getjobsonAdminside = async ( req, res ) =>{
  try {
    
  } catch (err) {
    console.error("getjobsonAdminside:", err);
    return res.status(500).json({ err: "Server error" });
  }
}

// admin ki side may bhi jobs show karwani hain uss k ui may  title, job type , expiration date dikhani hy then then jab vo uss ki details k liya click karta hy tu ussi job ki details show hooti hain ab may nay 2 tarhan ki api banai hoi hain appliucnt side par jis may jis may aik may just cards may jo data show karwana hy job posts ka vo hy uss may jitni bhi jobs hain uss ka data show hota hy or aik banai hy k jab vo view detaile par click karta hy tu uss job ki baki ki detail show hoti hy 


// // admin
// title, job type , expiration date { acce[pted , rejected, reported ] }


module.exports = { createJob, deleteJob, getJobById, updateJob, getJobs, expireJobs, getJobDetails , getRecruiterJobs, getjobsonAdminside }

