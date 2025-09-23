const express = require('express');
const router = express.Router();
const { createResume, getResume, updateResume, deleteResume } = require('../controllers/structureresumeController');
const { authorize } = require('../middlewares/authMiddleware');

// Create resume
router.post('/resume', authorize , createResume);

// Update resume by userId
router.put('/resume',authorize, updateResume);

// Get resume by userId
router.get('/resume',authorize, getResume);


// Delete resume by userId
router.delete('/resume/:userId',authorize, deleteResume);


module.exports = router;
