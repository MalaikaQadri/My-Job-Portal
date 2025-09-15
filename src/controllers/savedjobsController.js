const { SavedJob, Job } = require('../models');

// Save a job
const saveJob = async (req, res) => {
  try {
    const userId = req.user.id;  
    const { jobId } = req.body;

    // Prevent duplicate save
    const existing = await SavedJob.findOne({ where: { userId, jobId } });
    if (existing) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    const savedJob = await SavedJob.create({ userId, jobId });
    res.status(201).json(savedJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all saved jobs for logged-in user
const getMySavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedJobs = await SavedJob.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: 'job'
        }
      ]
    });

    res.json(savedJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a saved job
const removeSavedJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const deleted = await SavedJob.destroy({ where: { userId, jobId } });
    if (!deleted) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    res.json({ message: 'Job removed from saved list' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { removeSavedJob, getMySavedJobs, saveJob }
