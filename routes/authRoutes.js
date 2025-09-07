const express = require('express');
const { register, verifyOTP, resendOTP, login, logout, dashboard } = require('../controllers/authController');
const authMiddleware = require('../middleware/authmiddleware');
const router = express.Router();

// Render pages
router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/verify', (req, res) => {
    res.render('verify');
});

router.get('/dashboard', authMiddleware, (req, res) => {
    res.render('dashboard', { user: req.session.user }); // pass session data if needed
});

// Handle form submissions
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

module.exports = router;
