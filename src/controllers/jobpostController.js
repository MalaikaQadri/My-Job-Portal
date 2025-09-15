const { Job,Sequelize } = require('../models');
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
// =========================
// Job status 
// const jobStatus = new Date(jobExpirationDate)< new Date ()? "expired"  : "active";



// Get All Jobs
const getJobs = async (req, res) => {
  try {
    let {  page, limit } = req.query;

    page = parseInt(page) ||1;
    limit= parseInt(limit) || 10;

    const offset = (page -1) *limit;
    const {rows:jobs, count:totalJobs } = await Job.findAndCountAll({
      limit, offset, order:[["creatAt", "DESC"]],
    })

    return res.status(200).json({
      success: true,
      totalJobs,
      currentPage:page,
      totalPages:Math.cell(totalJobs/limit),
      jobs
    });
  } catch (err) {
    console.error("Error Fetching Jobs:",err);
    return res.status(500).json({ error: 'Server error' });
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

    return res.json({ message: "Expired jobs updated", count: updatedCount });
  } catch (error) {
    console.error("expireJobs error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


module.exports = {createJob, deleteJob, getJobById, updateJob, getJobs, expireJobs }

