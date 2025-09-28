// Zoom API Configuration
// To get your API credentials:
// 1. Go to https://marketplace.zoom.us/develop/create
// 2. Create a "Server to Server OAuth App"
// 3. Copy the Account ID, Client ID, and Client Secret

module.exports = {
  // Replace these with your actual Zoom API credentials
  accountId: process.env.ZOOM_ACCOUNT_ID || 'your_zoom_account_id_here',
  clientId: process.env.ZOOM_CLIENT_ID || 'your_zoom_client_id_here',
  clientSecret: process.env.ZOOM_CLIENT_SECRET || 'your_zoom_client_secret_here',
  
  // Default meeting settings
  defaultSettings: {
    duration: 60, // minutes
    timezone: 'UTC',
    host_video: true,
    participant_video: true,
    join_before_host: false,
    mute_upon_entry: true,
    watermark: false,
    use_pmi: false,
    approval_type: 0, // Automatically approve
    audio: 'both',
    auto_recording: 'none'
  }
};
