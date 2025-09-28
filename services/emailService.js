const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'pk2239@srmist.edu.in',
        pass: 'qhjcrtarcwrtmfju'
      }
    });
  }

  // Send Zoom meeting details to user and counsellor
  async sendMeetingNotification(user, counsellor, booking, zoomMeeting) {
    try {
      const meetingDate = new Date(booking.date).toLocaleDateString();
      const meetingTime = booking.slot;
      
      // Email to User
      const userEmailContent = {
        from: 'pk2239@srmist.edu.in',
        to: user.email,
        subject: `Your Counseling Session with ${counsellor.name} - Zoom Meeting Details`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your Counseling Session is Scheduled!</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Session Details</h3>
              <p><strong>Counsellor:</strong> ${counsellor.name}</p>
              <p><strong>Specialization:</strong> ${counsellor.specialization}</p>
              <p><strong>Date:</strong> ${meetingDate}</p>
              <p><strong>Time:</strong> ${meetingTime}</p>
              <p><strong>Duration:</strong> 60 minutes</p>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #059669; margin-top: 0;">🔗 Zoom Meeting Details</h3>
              <p><strong>Meeting Topic:</strong> ${zoomMeeting.topic}</p>
              <p><strong>Join URL:</strong> <a href="${zoomMeeting.joinUrl}" style="color: #2563eb;">Click here to join the meeting</a></p>
              ${zoomMeeting.password ? `<p><strong>Meeting Password:</strong> ${zoomMeeting.password}</p>` : ''}
              <p style="margin-top: 15px;">
                <a href="${zoomMeeting.joinUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Join Meeting
                </a>
              </p>
              ${zoomMeeting.joinUrl && zoomMeeting.joinUrl.includes('zoom.us/j/') ? `
                <div style="background-color: #fef3c7; padding: 10px; border-radius: 6px; margin-top: 10px;">
                  <p style="color: #92400e; font-size: 12px; margin: 0;">
                    <strong>Note:</strong> This is a temporary meeting link. Please contact your counselor to get the actual Zoom meeting details.
                  </p>
                </div>
              ` : ''}
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #d97706; margin-top: 0;">📋 Important Notes:</h4>
              <ul style="color: #92400e;">
                <li>Please join the meeting 5 minutes before your scheduled time</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Use headphones for better audio quality</li>
                <li>Find a quiet, private space for your session</li>
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              If you need to reschedule or cancel, please contact us as soon as possible.
            </p>
          </div>
        `
      };

      // Email to Counsellor
      const counsellorEmailContent = {
        from: 'pk2239@srmist.edu.in',
        to: counsellor.email,
        subject: `New Counseling Session Booking - Zoom Meeting Details`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Counseling Session Booking</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Session Details</h3>
              <p><strong>Student:</strong> ${user.name}</p>
              <p><strong>Student Email:</strong> ${user.email}</p>
              <p><strong>Course:</strong> ${user.course}</p>
              <p><strong>Year:</strong> ${user.year}</p>
              <p><strong>Instagram:</strong> ${user.Instagram || 'N/A'}</p>
              <p><strong>Date:</strong> ${meetingDate}</p>
              <p><strong>Time:</strong> ${meetingTime}</p>
              <p><strong>Duration:</strong> 60 minutes</p>
            </div>

            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #059669; margin-top: 0;">🔗 Zoom Meeting Details</h3>
              <p><strong>Meeting Topic:</strong> ${zoomMeeting.topic}</p>
              <p><strong>Start URL:</strong> <a href="${zoomMeeting.startUrl}" style="color: #2563eb;">Click here to start the meeting</a></p>
              <p><strong>Join URL:</strong> <a href="${zoomMeeting.joinUrl}" style="color: #2563eb;">Click here to join the meeting</a></p>
              ${zoomMeeting.password ? `<p><strong>Meeting Password:</strong> ${zoomMeeting.password}</p>` : ''}
              <p style="margin-top: 15px;">
                <a href="${zoomMeeting.startUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Start Meeting
                </a>
              </p>
              ${zoomMeeting.startUrl && zoomMeeting.startUrl.includes('zoom.us/j/') ? `
                <div style="background-color: #fef3c7; padding: 10px; border-radius: 6px; margin-top: 10px;">
                  <p style="color: #92400e; font-size: 12px; margin: 0;">
                    <strong>Note:</strong> This is a temporary meeting link. Please create a proper Zoom meeting and share the link with the student.
                  </p>
                </div>
              ` : ''}
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #d97706; margin-top: 0;">📋 Session Preparation:</h4>
              <ul style="color: #92400e;">
                <li>Review the student's information before the session</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Test your camera and microphone beforehand</li>
                <li>Prepare a quiet, professional environment</li>
              </ul>
            </div>
          </div>
        `
      };

      // Send emails
      await this.transporter.sendMail(userEmailContent);
      await this.transporter.sendMail(counsellorEmailContent);

      return { success: true };
    } catch (error) {
      console.error('Error sending meeting notification emails:', error);
      return { success: false, error: error.message };
    }
  }

  // Send booking confirmation without Zoom details (fallback)
  async sendBookingConfirmation(user, counsellor, booking) {
    try {
      const meetingDate = new Date(booking.date).toLocaleDateString();
      const meetingTime = booking.slot;
      
      const emailContent = {
        from: 'pk2239@srmist.edu.in',
        to: user.email,
        subject: `Your Counseling Session with ${counsellor.name} - Booking Confirmed`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your Counseling Session is Booked!</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Session Details</h3>
              <p><strong>Counsellor:</strong> ${counsellor.name}</p>
              <p><strong>Specialization:</strong> ${counsellor.specialization}</p>
              <p><strong>Date:</strong> ${meetingDate}</p>
              <p><strong>Time:</strong> ${meetingTime}</p>
              <p><strong>Duration:</strong> 60 minutes</p>
            </div>

            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #d97706; margin-top: 0;">📋 Important Notes:</h4>
              <ul style="color: #92400e;">
                <li>Zoom meeting details will be sent to you shortly</li>
                <li>Please check your email for the meeting link</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Find a quiet, private space for your session</li>
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              If you need to reschedule or cancel, please contact us as soon as possible.
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(emailContent);
      return { success: true };
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
