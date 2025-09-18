const Counsellor = require('../../models/counsellor');
const bcrypt = require('bcrypt');
const User = require('../../models/user'); // needed for populate

// ---------------- SIGNUP ----------------
exports.signup = async (req, res) => {
    try {
        const { name, email, password, qualifications, specialization, slots } = req.body;

        if (!name || !email || !password || !qualifications || !specialization || !slots) {
            return res.render("Counsellor/signup", { error: "All fields are required", success: null });
        }

        const existing = await Counsellor.findOne({ email });
        if (existing) {
            return res.render("Counsellor/login", { error: "Counsellor already exists. Please log in.", success: null });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Convert slots string into array (trim spaces)
        const slotsArray = slots.split(',').map(s => s.trim());

        const counsellor = new Counsellor({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            qualifications,
            specialization,
            slots: slotsArray,
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

        const counsellor = await Counsellor.findOne({ email }).populate('bookedBy');

        if (!counsellor) {
            return res.render("Counsellor/login", { error: "Counsellor not found", success: null });
        }

        const isMatch = await bcrypt.compare(password, counsellor.password);
        if (!isMatch) {
            return res.render("Counsellor/login", { error: "Invalid credentials", success: null });
        }

        req.session.counsellor = counsellor;

        // bookedBy is either a User object or null
        res.render("Counsellor/dashboard", { 
            bookedBy: counsellor.bookedBy || null,
            counsellor
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
