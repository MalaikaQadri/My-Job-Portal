
const express = require('express');
const router = express.Router();
const { applyJob, getJobApplications, updateApplicationStatus, getMyApplications } = require('../controllers/applicationController');
const { authorize, isRecruiter, isApplicant } = require('../middlewares/authMiddleware');


// applicant
router.post('/jobs/:jobId/apply', authorize, isApplicant , applyJob);
router.get('/my-applications', authorize, isApplicant , getMyApplications);

// recruiter
router.get('/jobs/:jobId/applications', authorize, isRecruiter, getJobApplications);
router.put('/applications/:applicationId/status', authorize, isRecruiter , updateApplicationStatus);

module.exports = router;

// i have one model name as users where all users data there including recruiters and applicant and am using squelize with postgrey here is model file and user profile controllers now tell me how to make controlleer for filter candidates 


