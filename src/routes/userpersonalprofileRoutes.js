const express = require("express");
const router = express.Router();
const {getUserProfile, updateUserProfile, updateAdminProfile} = require ("../controllers/userpersonalprofileController");
// const {searchCandidatesByTitle} = require("../controllers/applicantFilterController");

const { authorize } = require("../middlewares/authMiddleware");



router.get('/', authorize,  getUserProfile);
router.get('/:id', authorize,  getUserProfile);
router.put('/', authorize, updateUserProfile);
router.put('/', authorize, updateAdminProfile);

// router.get("/applicants/search", searchCandidatesByTitle);



module.exports = router;

