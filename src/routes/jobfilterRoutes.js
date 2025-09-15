const express = require('express');
const router = express.Router();
const { createJob, filterJobs, deleteJob, getJobs} = require('../controllers/jobfilterController');

router.post('/', createJob);
router.get('/', getJobs);
router.get('/filter',filterJobs);
router.delete('/:id',deleteJob);

module.exports = router;