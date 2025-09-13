const express = require('express');
const router = express.Router();
const counsellorController = require('../controllers/counsellorController');

// Route for listing counsellors
router.get("/", counsellorController.getCounsellors);
router.get("/home", counsellorController.getHome);
// Book a counsellor
router.post("/book", counsellorController.bookCounsellor);
router.get("/counsellor/:id/dashboard",counsellorController.getCounsellorDashboard);
router.post("/attended", counsellorController.markSessionAttended);
module.exports = router;