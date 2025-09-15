const express = require('express');
const router = express.Router();
const { createResume, getResume, updateResume, deleteResume } = require('../controllers/structureresumeController');

// Create resume
router.post('/resume', createResume);

// Update resume by userId
router.put('/resume/:userId', updateResume);

// Get resume by userId
router.get('/resume/:userId', getResume);


// Delete resume by userId
router.delete('/resume/:userId', deleteResume);


module.exports = router;
