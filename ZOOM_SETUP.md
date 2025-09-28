# Zoom Integration Setup Guide

This guide will help you set up Zoom meeting integration for your counseling platform.

## Prerequisites

1. A Zoom account (free or paid)
2. Access to Zoom Marketplace

## Step 1: Create a Zoom Server to Server OAuth App

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/develop/create)
2. Sign in with your Zoom account
3. Click "Develop" → "Build App"
4. Choose **"Server to Server OAuth App"** as the app type
5. Fill in the required information:
   - App Name: "Counseling Platform Integration"
   - Company Name: Your organization name
   - Developer Email: Your email address
6. Click "Create"

## Step 2: Get API Credentials

1. In your OAuth app dashboard, go to the "App Credentials" tab
2. Copy the following:
   - **Account ID**
   - **Client ID** 
   - **Client Secret**

## Step 3: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Zoom API Credentials (Server to Server OAuth)
ZOOM_ACCOUNT_ID=your_actual_account_id_here
ZOOM_CLIENT_ID=your_actual_client_id_here
ZOOM_CLIENT_SECRET=your_actual_client_secret_here

# Other existing variables...
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/counselling
SESSION_SECRET=your_session_secret_here
```

## Step 4: Install Dependencies

Run the following command to install the required packages:

```bash
npm install
```

## Step 5: Test the Integration

1. Start your application: `npm start`
2. Try booking a counselor
3. Check if:
   - A Zoom meeting is created
   - Email notifications are sent to both user and counselor
   - Meeting details appear in the booking

## Features Implemented

### ✅ Automatic Zoom Meeting Creation
- Creates a Zoom meeting when a user books a counselor
- Sets meeting duration to 60 minutes
- Configures appropriate meeting settings

### ✅ Email Notifications
- Sends detailed email to user with meeting link
- Sends notification email to counselor
- Includes meeting topic, date, time, and join links

### ✅ User Interface Updates
- Shows success notification after booking
- Displays Zoom meeting details in user's booking list
- Provides direct "Join Meeting" button

### ✅ Fallback Handling
- If Zoom API fails, still sends basic booking confirmation
- Graceful error handling for network issues

## Troubleshooting

### Common Issues

1. **"Invalid API credentials" error**
   - Double-check your API Key and Secret in the `.env` file
   - Ensure there are no extra spaces or quotes

2. **"Meeting creation failed" error**
   - Check your Zoom account permissions
   - Verify the API credentials are correct
   - Check the console logs for detailed error messages

3. **Emails not being sent**
   - Verify the email service configuration in `services/emailService.js`
   - Check the Gmail app password is correct

### Testing Without Zoom API

If you want to test the booking flow without setting up Zoom API:

1. The system will automatically fall back to sending basic booking confirmations
2. Users will see a message that meeting details are being prepared
3. You can manually create Zoom meetings and share the links

## Security Notes

- Never commit your `.env` file to version control
- Keep your API credentials secure
- Consider using environment-specific configurations for production

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test the Zoom API credentials independently
4. Ensure your Zoom account has the necessary permissions

## Next Steps

Consider implementing:
- Meeting recording capabilities
- Calendar integration
- Reminder emails before the session
- Meeting analytics and reporting
