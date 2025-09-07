const fs = require("fs");
const path = require("path");

const counsellorsPath = path.join(__dirname, "../data/counsellors.json");

// Show all counsellors
exports.getCounsellors = (req, res) => {
  fs.readFile(counsellorsPath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading data");
    const counsellors = JSON.parse(data);

    res.render("counsellors", {
      counsellors,
      user: req.session.user || null   // ✅ Pass user to EJS
    });
  });
};

// Book a counsellor
exports.bookCounsellor = (req, res) => {
  const { id, slot } = req.body;

  fs.readFile(counsellorsPath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading data");

    let counsellors = JSON.parse(data);
    let counsellor = counsellors.find(c => c.id == id);

    if (counsellor && !counsellor.booked) {
      counsellor.booked = true;
      counsellor.selectedSlot = slot;
    }

    fs.writeFile(counsellorsPath, JSON.stringify(counsellors, null, 2), err => {
      if (err) return res.status(500).send("Error saving booking");
      res.redirect("/home"); // redirect to home page after booking
    });
  });
};

exports.getHome = (req, res) => {
  fs.readFile(counsellorsPath, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error reading data");
    const counsellors = JSON.parse(data);
    res.render("home", {
      counsellors,
      user: req.session.user || null
    });
  });
};
