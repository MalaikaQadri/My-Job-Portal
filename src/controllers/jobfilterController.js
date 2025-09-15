const { Job, Industry, User } = require('../models');
const { Op } = require('sequelize');

// Create a Job
const createJob = async (req, res) => {
  try {
    const {
      title, location, experience, salaryMin, salaryMax,
      jobType, postedBy, industryId, description, responsibilities
    } = req.body;

    // Basic validation
    if (!title || !jobType || !salaryMin || !salaryMax || !postedBy || !industryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await Job.create({
      title,
      location,
      experience,
      salaryMin,
      salaryMax,
      jobType,
      postedBy,
      industryId,
      description,
      responsibilities
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Jobs with Industry + User
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      include: [
        { model: Industry, attributes: ['id', 'name'] },
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter Jobs (for your filter bar UI)
const filterJobs = async (req, res) => {
  try {
    const { title, location, industryId, experience, salary, jobType } = req.query;
    let where = {};

    // Keyword / title
    if (title) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${title}%` } },
        { description: { [Op.iLike]: `%${title}%` } },
        { tags: { [Op.overlap]: [title.toLowerCase()] } } // if tags exist
      ];
    }

    // Location
    if (location) where.location = { [Op.iLike]: `%${location}%` };

    // Industry
    if (industryId) where.industryId = industryId;

    // Experience range (e.g., "2-4")
    if (experience) {
      const [minExp, maxExp] = experience.split('-').map(Number);
      where.experience = { [Op.between]: [minExp, maxExp] };
    }

    // Salary range (e.g., "1000-2000") - overlap logic
    if (salary) {
      const [minSalary, maxSalary] = salary.split('-').map(Number);
      where[Op.and] = [
        { salaryMin: { [Op.lte]: maxSalary } },
        { salaryMax: { [Op.gte]: minSalary } }
      ];
    }

    // Job Type
    if (jobType && jobType !== 'all') {
      const jobTypes = jobType.split(',');
      where.jobType = { [Op.in]: jobTypes };
    }

    const jobs = await Job.findAll({
      where,
      include: [{ model: Industry, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a Job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Job.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: 'Job not found' });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createJob, filterJobs, deleteJob, getJobs };
