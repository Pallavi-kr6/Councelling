const express = require('express');
const { register, verifyOTP, resendOTP, login, logout, dashboard } = require('../../controllers/User/authController');
const authMiddleware = require('../../middleware/authmiddleware');
const router = express.Router();

// Render pages
router.get('/login', (req, res) => {
    res.render('User/login');
});

router.get('/signup', (req, res) => {
    res.render('User/signup');
});

router.get('/verify', (req, res) => {
    res.render('User/verify');
});

router.get('/dashboard', authMiddleware, (req, res) => {
    res.render('User/dashboard', { user: req.session.user }); // pass session data if needed
});

// Handle form submissions
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

module.exports = router;
