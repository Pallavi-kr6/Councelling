const express = require('express');
const app = express();
const session = require('express-session');
const connectDB = require('./config/db');
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Connect to MongoDB
connectDB();



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'supersecretkey',  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Routes
const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);
app.use('/', authRoutes);


// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
