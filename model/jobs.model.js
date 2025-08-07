import mongoose from 'mongoose';

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
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Closed'],
    default: 'Draft',
  },
}, { timestamps: true });

const JobPost = mongoose.model('JobPost', jobPostSchema);

export default JobPost;