const express = require('express');
const app = express();
const session = require('express-session');
const connectDB = require('./config/db');
const path = require('path');
const counsellorRoutes = require('./routes/counsellorRoutes'); // make sure path is correct
const authRoutes = require('./routes/authRoutes');
const counsellorController = require("./controllers/counsellorController");
// Connect to MongoDB
connectDB();

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/login`);
});
