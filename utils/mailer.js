import nodemailer from 'nodemailer';
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

export { sendJobAlertEmail };