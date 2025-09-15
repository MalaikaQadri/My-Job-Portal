const express = require('express');
const router = express.Router();
const { removeSavedJob, getMySavedJobs, saveJob } = require('../controllers/savedjobsController');
const {authorize} = require('../middlewares/authMiddleware'); 

// Save job
router.post('/', authorize, saveJob);

// Get logged-in user’s saved jobs
router.get('/', authorize, getMySavedJobs);

// Remove saved job
router.delete('/:jobId', authorize, removeSavedJob);

module.exports = router;

