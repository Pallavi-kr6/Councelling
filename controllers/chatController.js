require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handleMessage = async (req, res) => {
  try {
    const { message } = req.body;

    console.log("📩 User message:", message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: message }] }]
        }),
      }
    );

    console.log("🌐 Gemini API status:", response.status);

    const data = await response.json();
    console.log("🔍 Gemini API raw response:", JSON.stringify(data, null, 2));

    // Extract AI text safely
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No reply generated.";

    res.json({ reply: replyText });

  } catch (err) {
    console.error("❌ Error in handleMessage:", err);
    res.status(500).json({ error: 'Error processing message' });
  }
};
