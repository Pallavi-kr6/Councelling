const express = require('express');
const app = express();
require('dotenv').config();
const session = require('express-session');
const connectDB = require('./config/db');
const path = require('path');
const counsellorRoutes = require('./routes/User/counsellorRoutes'); 
const authRoutes = require('./routes/User/authRoutes');
const counsellorController = require("./controllers/User/counsellorController");
const chatRoutes = require("./routes/User/chatRoutes");
const counsellorAuthRoutes = require("./routes/Counsellor/counsellorRoutes");
const moodRoutes = require("./routes/User/moodRoutes");


// Connect to MongoDB
connectDB();

// Set EJS as templating engine

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Middleware to parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // false because we're not using HTTPS locally
}));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', authRoutes);
app.use('/counsellors', counsellorRoutes);
app.get("/home", counsellorController.getHome);
app.use("/api", chatRoutes);
app.use("/counsellor", counsellorAuthRoutes);
app.use("/mood", moodRoutes);
// app.use("/", counsellorRoutes);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/login`);
});
