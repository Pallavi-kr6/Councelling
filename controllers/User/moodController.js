const MoodTracking = require('../../models/MoodTracking');
const User = require('../../models/user');

// Helper to ensure user is logged in
const ensureLoggedIn = (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
    return false;
  }
  return true;
};

// ------------------------------
// Show mood tracking dashboard
// ------------------------------
exports.getMoodDashboard = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    
    // Get today's mood entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayMood = await MoodTracking.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    // Get last 7 days of mood data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentMoods = await MoodTracking.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(7);

    // Calculate weekly averages
    const weeklyStats = calculateWeeklyStats(recentMoods);

    res.render("User/moodDashboard", {
      user,
      todayMood,
      recentMoods,
      weeklyStats,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving mood data");
  }
};

// ------------------------------
// Save mood entry
// ------------------------------
exports.saveMoodEntry = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  try {
    const { mood, energy, stress, sleep, social, notes, tags } = req.body;
    const userId = req.session.user._id;

    // Validate input
    if (!mood || !energy || !stress || !sleep || !social) {
      return res.status(400).json({ error: "All mood fields are required" });
    }

    // Check if entry already exists for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingEntry = await MoodTracking.findOne({
      user: userId,
      date: { $gte: today, $lt: tomorrow }
    });

    let moodEntry;
    if (existingEntry) {
      // Update existing entry
      existingEntry.mood = parseInt(mood);
      existingEntry.energy = parseInt(energy);
      existingEntry.stress = parseInt(stress);
      existingEntry.sleep = parseInt(sleep);
      existingEntry.social = parseInt(social);
      existingEntry.notes = notes || "";
      existingEntry.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
      moodEntry = await existingEntry.save();
    } else {
      // Create new entry
      moodEntry = new MoodTracking({
        user: userId,
        mood: parseInt(mood),
        energy: parseInt(energy),
        stress: parseInt(stress),
        sleep: parseInt(sleep),
        social: parseInt(social),
        notes: notes || "",
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      });
      await moodEntry.save();
    }

    res.json({ 
      success: true, 
      message: "Mood entry saved successfully!",
      moodEntry: {
        id: moodEntry._id,
        wellbeingScore: moodEntry.wellbeingScore,
        moodEmoji: moodEntry.getMoodEmoji(),
        energyEmoji: moodEntry.getEnergyEmoji(),
        stressEmoji: moodEntry.getStressEmoji()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving mood entry" });
  }
};

// ------------------------------
// Get mood history
// ------------------------------
exports.getMoodHistory = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  try {
    const userId = req.session.user._id;
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    startDate.setHours(0, 0, 0, 0);

    const moodHistory = await MoodTracking.find({
      user: userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    // Calculate statistics
    const stats = calculateMoodStats(moodHistory);

    res.render("User/moodHistory", {
      moodHistory,
      stats,
      period,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving mood history");
  }
};

// ------------------------------
// Generate weekly report
// ------------------------------
exports.getWeeklyReport = async (req, res) => {
  if (!ensureLoggedIn(req, res)) return;

  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    
    // Get last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyData = await MoodTracking.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    const report = generateWeeklyReport(weeklyData, user);

    res.render("User/weeklyReport", {
      report,
      weeklyData,
      user: req.session.user || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating weekly report");
  }
};

// ------------------------------
// Helper functions
// ------------------------------

function calculateWeeklyStats(moods) {
  if (moods.length === 0) {
    return {
      avgMood: 0,
      avgEnergy: 0,
      avgStress: 0,
      avgSleep: 0,
      avgSocial: 0,
      avgWellbeing: 0,
      totalEntries: 0
    };
  }

  const totals = moods.reduce((acc, mood) => {
    acc.mood += mood.mood;
    acc.energy += mood.energy;
    acc.stress += mood.stress;
    acc.sleep += mood.sleep;
    acc.social += mood.social;
    acc.wellbeing += mood.wellbeingScore;
    return acc;
  }, { mood: 0, energy: 0, stress: 0, sleep: 0, social: 0, wellbeing: 0 });

  const count = moods.length;
  return {
    avgMood: Math.round((totals.mood / count) * 10) / 10,
    avgEnergy: Math.round((totals.energy / count) * 10) / 10,
    avgStress: Math.round((totals.stress / count) * 10) / 10,
    avgSleep: Math.round((totals.sleep / count) * 10) / 10,
    avgSocial: Math.round((totals.social / count) * 10) / 10,
    avgWellbeing: Math.round((totals.wellbeing / count) * 10) / 10,
    totalEntries: count
  };
}

function calculateMoodStats(moods) {
  if (moods.length === 0) {
    return {
      totalEntries: 0,
      avgWellbeing: 0,
      bestDay: null,
      worstDay: null,
      moodTrend: 'stable',
      topTags: []
    };
  }

  const stats = calculateWeeklyStats(moods);
  
  // Find best and worst days
  const bestDay = moods.reduce((best, current) => 
    current.wellbeingScore > best.wellbeingScore ? current : best
  );
  
  const worstDay = moods.reduce((worst, current) => 
    current.wellbeingScore < worst.wellbeingScore ? current : worst
  );

  // Calculate trend
  const firstHalf = moods.slice(0, Math.floor(moods.length / 2));
  const secondHalf = moods.slice(Math.floor(moods.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, mood) => sum + mood.wellbeingScore, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, mood) => sum + mood.wellbeingScore, 0) / secondHalf.length;
  
  let moodTrend = 'stable';
  if (secondHalfAvg > firstHalfAvg + 0.5) moodTrend = 'improving';
  else if (secondHalfAvg < firstHalfAvg - 0.5) moodTrend = 'declining';

  // Get top tags
  const allTags = moods.flatMap(mood => mood.tags);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  
  const topTags = Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  return {
    ...stats,
    bestDay,
    worstDay,
    moodTrend,
    topTags
  };
}

function generateWeeklyReport(moods, user) {
  const stats = calculateWeeklyStats(moods);
  
  // Generate insights
  const insights = [];
  
  if (stats.avgMood >= 7) {
    insights.push("You've been in a great mood this week! 😊");
  } else if (stats.avgMood <= 4) {
    insights.push("You might want to focus on activities that boost your mood this week.");
  }
  
  if (stats.avgStress >= 7) {
    insights.push("Your stress levels have been high. Consider relaxation techniques.");
  } else if (stats.avgStress <= 3) {
    insights.push("Great job managing stress this week! 🧘‍♀️");
  }
  
  if (stats.avgSleep >= 7) {
    insights.push("Your sleep quality has been excellent! 💤");
  } else if (stats.avgSleep <= 4) {
    insights.push("Consider improving your sleep routine for better wellbeing.");
  }

  // Generate recommendations
  const recommendations = [];
  
  if (stats.avgMood < 6) {
    recommendations.push("Try engaging in activities you enjoy");
  }
  
  if (stats.avgEnergy < 6) {
    recommendations.push("Consider regular exercise or outdoor activities");
  }
  
  if (stats.avgStress > 6) {
    recommendations.push("Practice mindfulness or meditation");
  }
  
  if (stats.avgSocial < 6) {
    recommendations.push("Connect with friends or family members");
  }

  return {
    stats,
    insights,
    recommendations,
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    weekEnd: new Date().toLocaleDateString()
  };
}
