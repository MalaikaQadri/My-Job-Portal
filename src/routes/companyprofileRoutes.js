const express = require('express');
const router = express.Router();
const { getRecruiterProfile, updateRecruiterProfile } = require('../controllers/companyprofileController');
const { authorize } = require('../middlewares/authMiddleware');





// Get recruiter profile  
router.get('/profile', authorize, getRecruiterProfile);

// Update recruiter profile
router.put('/profile', authorize, updateRecruiterProfile);

module.exports = router; 




 

