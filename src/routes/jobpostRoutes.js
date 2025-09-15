const express = require('express');
const router = express.Router();
const { createJob,deleteJob, getJobById, updateJob,getJobs, expireJobs } = require('../controllers/jobpostController');
const { authorize } = require('../middlewares/authMiddleware');



router.post('/', authorize, createJob);
router.get('/', getJobs);
router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.delete('/:id', authorize ,deleteJob);
router.put('/expire-jobs', expireJobs )

module.exports = router;
