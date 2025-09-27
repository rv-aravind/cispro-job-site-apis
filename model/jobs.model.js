// model/jobs.model.js
import mongoose from 'mongoose';
import JobAlert from './jobAlert.model.js';
import { sendJobAlertEmail } from '../utils/mailer.js';

const jobPostSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employer is required'],
  },
  companyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProfile',
    required: [true, 'Company profile is required'],
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  contactUsername: {
    type: String,
    trim: true,
  },
  specialisms: {
    type: [String],
    required: [true, 'At least one specialism is required'],
  },
  jobType: {
    type: String,
    required: [true, 'Job type is required'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary'],
  },
  offeredSalary: {
    type: String,
    required: [true, 'Offered salary is required'],
    enum: ['$1500', '$2000', '$2500', '$3500', '$4500', '$5000', 'Negotiable'],
  },
  careerLevel: {
    type: String,
    required: [true, 'Career level is required'],
    enum: ['Entry Level', 'Intermediate', 'Mid Level', 'Senior Level', 'Executive'],
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
    enum: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'No Preference'],
    default: 'No Preference',
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
    enum: ['High School', 'Associate Degree', 'Bachelor’s Degree', 'Master’s Degree', 'Doctorate', 'Other'],
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
  },
  applicantCount: {
    type: Number,
    default: 0,
  },
  location: {
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    completeAddress: {
      type: String,
      required: [true, 'Complete address is required'],
      trim: true,
    },
  },
  remoteWork: {
    // Added for 2025 trend: remote work options
    type: String,
    enum: ['On-site', 'Hybrid', 'Remote'],
    default: 'On-site',
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Closed'],
    default: 'Published',
  },
}, { timestamps: true });


/**
 * Mongoose post-save hook for JobPost.
 * Triggers job alert notifications if a new published job matches any alert criteria.
 */
jobPostSchema.post('save', async function (doc) {
  try {
    if (doc.status !== 'Published') return;

    // Populate company name
    const populatedDoc = await mongoose.model('JobPost')
      .findById(doc._id)
      .populate('companyProfile', 'companyName');

    const alerts = await JobAlert.find({ isActive: true }).populate('candidate', 'email');
    console.log('Found job alerts:', alerts);
    
    for (const alert of alerts) {
      if (alert.frequency !== 'Instant') continue;

      const matches = matchJobToAlert(populatedDoc, alert.criteria);
      if (matches && alert.candidate.email) {
        await sendJobAlertEmail({
          recipient: alert.candidate.email,
          jobTitle: populatedDoc.title,
          companyName: populatedDoc.companyProfile.companyName,
          jobId: populatedDoc._id,
        });
      }
    }
  } catch (err) {
    console.error('Error in jobPost save hook:', err);
  }
});

/**
 * Determines if a job post matches the alert criteria.
 * @param {Object} job - The job post document
 * @param {Object} criteria - The alert criteria
 * @returns {boolean} - True if the job matches the alert criteria
 */
function matchJobToAlert(job, criteria) {
  if (criteria.categories?.length > 0 &&
      !criteria.categories.some(cat => job.specialisms.includes(cat))) return false;

  if (criteria.location?.city && criteria.location.city !== job.location.city) return false;

  if (criteria.salaryRange && job.offeredSalary !== 'Negotiable') {
    const jobSalary = parseFloat(job.offeredSalary.replace('$', '')) || 0;
    if (jobSalary < criteria.salaryRange.min ||
        (criteria.salaryRange.max && jobSalary > criteria.salaryRange.max)) return false;
  }

  if (criteria.jobType && criteria.jobType !== job.jobType) return false;
  if (criteria.experience && criteria.experience !== job.experience) return false;

  if (criteria.keywords?.length > 0 &&
      !criteria.keywords.some(kw => job.title.includes(kw) || job.description.includes(kw))) return false;

  return true;
}

const JobPost = mongoose.model('JobPost', jobPostSchema);

export default JobPost;