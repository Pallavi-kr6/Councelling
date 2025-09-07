const express = require("express");
const router = express.Router();
const counsellorController = require("../controllers/counsellorController");

// Route for listing counsellors
router.get("/", counsellorController.getCounsellors);
//router.get("/home", counsellorController.getHome);
// Book a counsellor
router.post("/book", counsellorController.bookCounsellor);
router.get("/book", (req, res) => {
  res.send("Use the form on /counsellors to book a counsellor.");
});

module.exports = router;  
