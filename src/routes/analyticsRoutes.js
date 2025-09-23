const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { isAdmin, authorize } = require("../middlewares/authMiddleware");

// Only admin can access
router.get("/analytics", authorize , isAdmin, getAnalytics);

module.exports = router;

