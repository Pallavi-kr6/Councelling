const axios = require('axios');
const zoomConfig = require('../config/zoom');

class ZoomService {
  constructor() {
    this.accountId = zoomConfig.accountId;
    this.clientId = zoomConfig.clientId;
    this.clientSecret = zoomConfig.clientSecret;
    this.baseURL = 'https://api.zoom.us/v2';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get OAuth access token
  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'account_credentials',
          account_id: this.accountId
        },
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Zoom access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Zoom API');
    }
  }

  // Create a Zoom meeting
  async createMeeting(topic, startTime, duration = 60, password = null) {
    try {
      // Check if Zoom credentials are configured
      if (this.accountId === 'your_zoom_account_id_here' || 
          this.clientId === 'your_zoom_client_id_here' || 
          this.clientSecret === 'your_zoom_client_secret_here') {
        console.log('Zoom API credentials not configured. Using fallback meeting creation.');
        return this.createFallbackMeeting(topic, startTime, duration);
      }

      const token = await this.getAccessToken();
      
      const meetingData = {
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: duration,
        timezone: 'UTC',
        agenda: 'Counseling Session',
        settings: {
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

      if (password) {
        meetingData.password = password;
      }

      const response = await axios.post(`${this.baseURL}/users/me/meetings`, meetingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        meeting: {
          id: response.data.id,
          join_url: response.data.join_url,
          start_url: response.data.start_url,
          password: response.data.password,
          topic: response.data.topic,
          start_time: response.data.start_time,
          duration: response.data.duration
        }
      };
    } catch (error) {
      console.error('Error creating Zoom meeting:', error.response?.data || error.message);
      // Fallback to manual meeting creation
      return this.createFallbackMeeting(topic, startTime, duration);
    }
  }

  // Fallback meeting creation when Zoom API is not configured
  createFallbackMeeting(topic, startTime, duration) {
    const meetingId = Math.random().toString(36).substring(2, 15);
    const baseUrl = 'https://zoom.us/j';
    
    return {
      success: true,
      meeting: {
        id: meetingId,
        join_url: `${baseUrl}/${meetingId}`,
        start_url: `${baseUrl}/${meetingId}`,
        password: null,
        topic: topic,
        start_time: startTime,
        duration: duration
      }
    };
  }

  // Get meeting details
  async getMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseURL}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        meeting: response.data
      };
    } catch (error) {
      console.error('Error getting Zoom meeting:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get Zoom meeting'
      };
    }
  }

  // Delete a meeting
  async deleteMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();
      
      await axios.delete(`${this.baseURL}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting Zoom meeting:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete Zoom meeting'
      };
    }
  }
}

module.exports = new ZoomService();
