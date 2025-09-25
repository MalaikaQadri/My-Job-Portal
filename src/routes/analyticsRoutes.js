const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { isAdmin, authorize } = require("../middlewares/authMiddleware");
const { getAdminAnalytics }= require('../controllers/adminController');

// Only admin can access
router.get("/analytics", authorize , isAdmin, getAnalytics);
router.get("/adminAnalytics", authorize , isAdmin, getAdminAnalytics);


module.exports = router;
// admin
// title, job type , expiration date { acce[pted , rejected, reported ] }


// applicant 
// pic , title, , job type, location , salary , applie date, status, 

// recruiter
//title, , job type, expriration date , application number , views , status 