import nodemailer from 'nodemailer';
import ResumeAlert from '../models/resumeAlert.model.js';
import { BadRequestError } from './errors.js';

// Configure transporter (use environment variables for security)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'smtp.sendgrid.net' for SendGrid, etc.
  auth: {
    user: process.env.EMAIL_USER, // e.g., 'your-email@gmail.com'
    pass: process.env.EMAIL_PASS, // Gmail App Password or API key
  },
});

// test mail configuration
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: 'avarvind3765@gmail.com', pass: 'pogdwcemqatjvonk' },
// });
// transporter.sendMail({
//   from: 'avarvind3765@gmail.com',
//   to: 'aravindakumar3315@gmail.com',
//   subject: 'Test',
//   text: 'Test email',
// }, (err, info) => {
//   console.log(err || info);
// });

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email transporter ready');
    // In mailer.js, add at the top
  }
});

// Function to send job alert email
const sendJobAlertEmail = async ({ recipient, jobTitle, companyName, jobId }) => {
  try {

    if (!recipient) {
      throw new Error('Recipient email is missing');
    }
    
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `New Job Alert: ${jobTitle}`,
      html: `
        <h2>New Job Opportunity!</h2>
        <p>A new job matching your alert criteria has been posted:</p>
        <p><strong>Job Title:</strong> ${jobTitle}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><a href="http://localhost:5000/jobs/${jobId}">View Job Details</a></p>
        <p>Update your job alerts or apply directly via your dashboard.</p>
        <p>Best regards,<br>Cispro Job Portal Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient} for job ${jobTitle}`);
  } catch (error) {
    console.error(`Failed to send email to ${recipient}:`, error);
    throw new BadRequestError('Failed to send job alert email');
  }
};


// PASSWORD RESET EMAIL FUNCTION
const sendPasswordResetEmail = async ({ recipient, name, resetUrl, message }) => {
  try {
    if (!recipient) {
      throw new Error('Recipient email is missing');
    }

    const mailOptions = {
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>

          <p>Hi ${name || 'User'},</p>

          <p>
            ${message || 'You recently requested to reset your password. Click the button below to proceed.'}
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
              style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>

          <p>If you didn’t request this, please ignore this email — your account is safe.</p>

          <p style="color: #64748b; font-size: 14px; margin-top: 40px;">
            This link will expire in <strong>10 minutes</strong> for security reasons.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />

          <p style="color: #64748b; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'HR Portal'}<br />
            This is an automated message — please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${recipient}`);
  } catch (error) {
    console.error(`Failed to send password reset email to ${recipient}:`, error);
    throw new Error('Failed to send password reset email');
  }
};


// resume alert function
// const sendResumeAlertEmail = async ({ recipient, candidateName, jobTitle, profileId, alert }) => {
//   try {
//     if (!recipient) {
//       throw new Error('Recipient email is missing');
//     }
//     const mailOptions = {
//       from: `"Talent Alerts" <${process.env.EMAIL_USER}>`,
//       to: recipient,
//       subject: `New Resume Alert: ${candidateName} for "${alert.title}"`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h2 style="color: #2563eb;">New Candidate Match!</h2>
//           <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h3 style="margin-top: 0;">Alert: ${alert.title}</h3>
//             <p><strong>Candidate:</strong> ${candidateName}</p>
//             <p><strong>Job Title:</strong> ${jobTitle}</p>
//             <p><strong>Criteria:</strong></p>
//             <ul>
//               ${alert.criteria.categories?.length > 0 ? `<li>Categories: ${alert.criteria.categories.join(', ')}</li>` : ''}
//               ${alert.criteria.location?.city ? `<li>Location: ${alert.criteria.location.city}</li>` : ''}
//               ${alert.criteria.experience ? `<li>Experience: ${alert.criteria.experience}</li>` : ''}
//               ${alert.criteria.skills?.length > 0 ? `<li>Skills: ${alert.criteria.skills.join(', ')}</li>` : ''}
//               ${alert.criteria.educationLevels?.length > 0 ? `<li>Education: ${alert.criteria.educationLevels.join(', ')}</li>` : ''}
//             </ul>
//           </div>
//           <div style="text-align: center; margin-top: 20px;">
//             <a href="${process.env.FRONTEND_URL}/employer/candidates/${profileId}" 
//                style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
//               View Candidate Profile
//             </a>
//           </div>
//           <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
//             <p style="color: #64748b; font-size: 14px;">
//               You're receiving this email because you set up a resume alert on our platform.<br>
//               <a href="${process.env.FRONTEND_URL}/employer/resume-alerts/${alert._id}/manage" style="color: #2563eb;">Manage this alert</a> |
//               <a href="${process.env.FRONTEND_URL}/employer/notification-settings" style="color: #2563eb;">Notification Settings</a>
//             </p>
//           </div>
//         </div>
//       `,
//     };
//     await transporter.sendMail(mailOptions);
//     console.log(`Resume alert email sent to ${recipient} for candidate ${candidateName}`);
//     await ResumeAlert.findByIdAndUpdate(alert._id, {
//       $inc: { 'stats.emailsSent': 1, 'stats.totalMatches': 1 },
//       $set: { 'stats.lastMatch': new Date() },
//     });
//   } catch (error) {
//     console.error(`Failed to send resume alert email to ${recipient}:`, error);
//     throw new BadRequestError('Failed to send resume alert email');
//   }
// };


/**
 * Sends a Resume Alert Email
 */
const sendResumeAlertEmail = async ({
  recipient,
  candidateName,
  jobTitle,
  profileId,
  alert,
  matchScore,
}) => {
  try {
    if (!recipient) throw new Error('Recipient email is missing');

    const mailOptions = {
      from: `"Talent Alerts" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `New Resume Match: ${candidateName} for "${alert.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎯 New Candidate Match!</h2>
          <p>We found a new candidate who closely matches your alert <strong>"${alert.title}"</strong>.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Candidate:</strong> ${candidateName}</p>
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p><strong>Match Score:</strong> ${matchScore ? matchScore.toFixed(1) + '%' : 'N/A'}</p>
            <p><strong>Criteria:</strong></p>
            <ul>
              ${
                alert.criteria.categories?.length
                  ? `<li>Categories: ${alert.criteria.categories.join(', ')}</li>`
                  : ''
              }
              ${
                alert.criteria.location?.city
                  ? `<li>Location: ${alert.criteria.location.city}</li>`
                  : ''
              }
              ${
                alert.criteria.experience
                  ? `<li>Experience: ${alert.criteria.experience}</li>`
                  : ''
              }
              ${
                alert.criteria.skills?.length
                  ? `<li>Skills: ${alert.criteria.skills.join(', ')}</li>`
                  : ''
              }
              ${
                alert.criteria.educationLevels?.length
                  ? `<li>Education: ${alert.criteria.educationLevels.join(', ')}</li>`
                  : ''
              }
            </ul>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/employer/candidates/${profileId}" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Candidate Profile
            </a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px;">
              You’re receiving this email because you set up a resume alert on our platform.<br>
              <a href="${process.env.FRONTEND_URL}/employer/resume-alerts/${alert._id}/manage" style="color: #2563eb;">Manage this alert</a> |
              <a href="${process.env.FRONTEND_URL}/employer/notification-settings" style="color: #2563eb;">Notification Settings</a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(
      `📧 Resume alert sent to ${recipient} for candidate ${candidateName} (${matchScore.toFixed(
        1
      )}%)`
    );

    await ResumeAlert.findByIdAndUpdate(alert._id, {
      $inc: { 'stats.emailsSent': 1, 'stats.totalMatches': 1 },
      $set: { 'stats.lastMatch': new Date() },
    });
  } catch (error) {
    console.error(`Failed to send resume alert email to ${recipient}:`, error);
    throw new Error('Failed to send resume alert email');
  }
};


// Send welcome email to new user
const sendWelcomeEmail = async ({ recipient, name }) => {
  try {
    if (!recipient) throw new Error('Recipient email is missing');

    const mailOptions = {
      from: `"Welcome to Coimbatore Jobs" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: 'Welcome to Coimbatore Jobs - Your Registration is Successful!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #2563eb;">Welcome, ${name}!</h2>
          
          <p>Thank you for registering with <strong>Coimbatore Jobs</strong>. Your account has been successfully created.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>What’s Next?</strong></p>
            <ul style="list-style-type: disc; padding-left: 20px;">
              <li>Complete your profile to get better job matches</li>
              <li>Browse and apply to jobs in Coimbatore</li>
              <li>Set up job alerts for personalized notifications</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Go to Dashboard
            </a>
          </div>
          
          <p>If you have any questions, our support team is here to help at support@coimbatorejobs.com.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} Coimbatore Jobs by Cispro. All rights reserved.<br />
            This is an automated message — please do not reply.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${recipient}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${recipient}:`, error);
  }
};

// Send alert to superadmin on new registration
const sendSuperadminAlertEmail = async ({ superadminEmail, newUserEmail, newUserRole }) => {
  try {
    if (!superadminEmail) throw new Error('Superadmin email not configured');

    const mailOptions = {
      from: `"System Alert" <${process.env.EMAIL_USER}>`,
      to: superadminEmail,
      subject: 'New User Registration Alert',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #ef4444;">New User Registered</h2>
          
          <p>A new user has registered on Coimbatore Jobs:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Email:</strong> ${newUserEmail}</p>
            <p><strong>Role:</strong> ${newUserRole.charAt(0).toUpperCase() + newUserRole.slice(1)}</p>
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/users" 
               style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View Users Dashboard
            </a>
          </div>
          
          <p>This is an automated alert for monitoring purposes.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
          
          <p style="color: #64748b; font-size: 12px; text-align: center;">
            &copy; ${new Date().getFullYear()} Coimbatore Jobs by Cispro. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Superadmin alert sent for new user ${newUserEmail}`);
  } catch (error) {
    console.error(`Failed to send superadmin alert:`, error);
  }
};

export { sendJobAlertEmail, sendResumeAlertEmail, sendPasswordResetEmail, sendWelcomeEmail, sendSuperadminAlertEmail };