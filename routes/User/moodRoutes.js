const express = require('express');
const router = express.Router();
const moodController = require('../../controllers/User/moodController');

// Mood tracking routes
router.get('/', moodController.getMoodDashboard);
router.post('/save', moodController.saveMoodEntry);
router.get('/history', moodController.getMoodHistory);
router.get('/report', moodController.getWeeklyReport);

module.exports = router;
