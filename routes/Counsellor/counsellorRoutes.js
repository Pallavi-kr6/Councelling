const express = require('express');
const router = express.Router();
const counsellorController = require('../../controllers/Counsellor/counsellorController');

// Redirect /counsellor to login if not logged in
router.get('/', (req, res) => {
  if (!req.session.counsellor) {
    return res.redirect('/counsellor/login');
  }
  // If logged in, go to dashboard
  res.redirect('/counsellor/dashboard');
});

// Signup
router.get('/signup', (req, res) => res.render("Counsellor/signup", { error: null, success: null }));
router.post('/signup', counsellorController.signup);

// Login
router.get('/login', (req, res) => {
  if (req.session.counsellor) {
    return res.redirect('/counsellor/dashboard'); // already logged in
  }
  res.render("Counsellor/login", { error: null, success: null });
});
router.post('/login', counsellorController.login);

// Dashboard (protected)
router.get('/dashboard', counsellorController.dashboard);

// Logout
router.get('/logout', (req, res) => {
  counsellorController.logout(req, res);
});

module.exports = router;
