const Counsellor = require('../../models/counsellor');
const bcrypt = require('bcrypt');
const User = require('../../models/user'); // needed for populate
const Booking = require('../../models/Booking');

// ---------------- SIGNUP ----------------
exports.signup = async (req, res) => {
    try {
        const { name, email, password, qualifications, specialization, monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;

        if (!name || !email || !password || !qualifications || !specialization) {
            return res.render("Counsellor/signup", { error: "All fields are required", success: null });
        }

        const existing = await Counsellor.findOne({ email });
        if (existing) {
            return res.render("Counsellor/login", { error: "Counsellor already exists. Please log in.", success: null });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Helper function to parse time slots
        const parseTimeSlots = (timeString) => {
            if (!timeString || timeString.trim() === '') return [];
            return timeString.split(',').map(s => s.trim()).filter(s => s !== '');
        };

        // Build weekly schedule
        const weeklySchedule = {
            monday: parseTimeSlots(monday),
            tuesday: parseTimeSlots(tuesday),
            wednesday: parseTimeSlots(wednesday),
            thursday: parseTimeSlots(thursday),
            friday: parseTimeSlots(friday),
            saturday: parseTimeSlots(saturday),
            sunday: parseTimeSlots(sunday),
        };

        // Get all unique slots for backward compatibility
        const allSlots = [];
        Object.values(weeklySchedule).forEach(daySlots => {
            daySlots.forEach(slot => {
                if (!allSlots.includes(slot)) {
                    allSlots.push(slot);
                }
            });
        });

        const counsellor = new Counsellor({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            qualifications,
            specialization,
            weeklySchedule,
            slots: allSlots, // Keep for backward compatibility
        });

        await counsellor.save();

        res.render("Counsellor/login", { success: "Signup successful! Please log in.", error: null });

    } catch (err) {
        console.error(err);
        res.status(500).render("Counsellor/signup", { error: "Server error, please try again", success: null });
    }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const counsellor = await Counsellor.findOne({ email });

        if (!counsellor) {
            return res.render("Counsellor/login", { error: "Counsellor not found", success: null });
        }

        const isMatch = await bcrypt.compare(password, counsellor.password);
        if (!isMatch) {
            return res.render("Counsellor/login", { error: "Invalid credentials", success: null });
        }

        req.session.counsellor = counsellor;

        // Fetch all bookings for this counsellor
        const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
        
        const bookings = await Booking.find({
            counsellor: counsellor._id,
            date: { 
                $gte: new Date(selectedDate), 
                $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000) 
            },
            status: 'booked'
        }).populate({
            path: 'user',
            select: 'name email Instagram course year'
        });

        res.render("Counsellor/dashboard", { 
            counsellor,
            bookings,
            selectedDate
        });

    } catch (err) {
        console.error(err);
        res.status(500).render("Counsellor/login", { error: "Server error, please try again", success: null });
    }
};

// ---------------- DASHBOARD ----------------
exports.dashboard = async (req, res) => {
    try {
        if (!req.session.counsellor) {
            return res.redirect('/counsellor/login');
        }

        const counsellor = req.session.counsellor;
        const selectedDate = req.query.date || new Date().toISOString().split('T')[0];
        
        // Fetch all bookings for this counsellor
        const bookings = await Booking.find({
            counsellor: counsellor._id,
            date: { 
                $gte: new Date(selectedDate), 
                $lt: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000) 
            },
            status: 'booked'
        }).populate({
            path: 'user',
            select: 'name email Instagram course year'
        });

        res.render("Counsellor/dashboard", { 
           
            counsellor,
            bookings,
            selectedDate
        });
    } catch (err) {
        console.error(err);
        res.status(500).render("Counsellor/login", { error: "Server error, please try again", success: null });
    }
};

// ---------------- LOGOUT ----------------
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send("Error logging out");
        }
        res.clearCookie('connect.sid');
        res.redirect("/counsellor/login");
    });
};
