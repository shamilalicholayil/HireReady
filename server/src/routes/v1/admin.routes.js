const { Router } = require("express");
const router = Router();
const { protect, isAdmin } = require("../../middlewares/auth.middleware");
const { getDashboardStats } = require("../../controllers/adminController");

router.get("/dashboard-stats", protect, isAdmin, getDashboardStats);

module.exports = router;
