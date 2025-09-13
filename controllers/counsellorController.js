const Counsellor = require("../models/counsellor");
const User = require("../models/user");

// ------------------------------
// Helper to ensure user is logged in
// ------------------------------
const ensureLoggedIn = (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
    return false;
  }
  return true;
};

// ------------------------------
// Show all counsellors
// ------------------------------
exports.getCounsellors = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const counsellors = await Counsellor.find().populate("bookedBy");

    let bookedCounsellorIds = [];
    if (userId) {
      const user = await User.findById(userId);
      bookedCounsellorIds = user?.bookedCounsellors?.map(String) || [];
    }

    res.render("counsellors", {
      counsellors,
      bookedCounsellorIds,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving counsellors");
  }
};

// ------------------------------
// Book a counsellor
// ------------------------------
exports.bookCounsellor = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  const { id, slot } = req.body;
  if (!id || !slot) return res.status(400).send("Counsellor ID and slot required");

  try {
    // Atomically book counsellor if not already booked
    const counsellor = await Counsellor.findOneAndUpdate(
      { _id: id, booked: false },
      { booked: true, selectedSlot: slot, bookedBy: req.session.user._id },
      { new: true }
    );

    if (!counsellor) return res.status(400).send("This counsellor is already booked");
    
    // Add to user's bookedCounsellors
    await User.findByIdAndUpdate(req.session.user._id, { $push: { bookedCounsellors: counsellor._id } });

    res.redirect("/counsellors");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error booking counsellor");
  }
};

// ------------------------------
// Home route
// ------------------------------
exports.getHome = async (req, res) => {
  try {
    const counsellors = await Counsellor.find();
    res.render("home", { counsellors, user: req.session.user || null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving counsellors");
  }
};

// ------------------------------
// Counsellor Dashboard
// ------------------------------
exports.getCounsellorDashboard = async (req, res) => {
  try {
    const counsellorId = req.params.id;
    const counsellor = await Counsellor.findById(counsellorId);

    if (!counsellor) return res.status(404).send("Counsellor not found");

    res.render("counsellorDashboard", { counsellor });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ------------------------------
// Mark session as attended
// ------------------------------
exports.markSessionAttended = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  const { id } = req.body; // counsellor id

  try {
    const counsellor = await Counsellor.findById(id);
    if (!counsellor) return res.status(404).send("Counsellor not found");

    // Reset booking
    counsellor.attended = true;
    counsellor.booked = false;
    counsellor.bookedBy = null;
    counsellor.selectedSlot = null;
    await counsellor.save();

    // Remove counsellor from user's bookedCounsellors
    await User.findByIdAndUpdate(req.session.user._id, { $pull: { bookedCounsellors: id } });

    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error marking session as attended");
  }
};
