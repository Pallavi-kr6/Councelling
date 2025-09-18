const express = require("express");
const router = express.Router();
const chatController = require('../../controllers/User/chatController');

router.post("/chat", chatController.handleMessage);

module.exports = router;
