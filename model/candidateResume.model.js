import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  fieldOfStudy: String,
  startDate: Date,
  endDate: Date,
  current: Boolean,
  grade: String,
  description: String,
  _id: false
});

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  },
  location: String,
  startDate: Date,
  endDate: Date,
  current: Boolean,
  description: String,
  achievements: [String],
  skills: [String],
  _id: false
});

const awardSchema = new mongoose.Schema({
  title: String,
  issuer: String,
  date: Date,
  description: String,
  _id: false
});

const portfolioSchema = new mongoose.Schema({
  file: { type: String, required: true }, // Path to uploaded file
  title: { type: String, required: true },
  description: { type: String, trim: true },
  _id: false
});

const candidateResumeSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true }, // e.g., "My Professional Resume"
  description: { type: String, trim: true }, // Overall summary
  template: {
    type: String,
    enum: ['professional', 'modern', 'creative', 'minimalist'],
    default: 'professional'
  },
  personalInfo: {
    fullName: String,
    professionalTitle: String,
    email: String,
    phone: String,
    location: {
      city: String,
      country: String
    },
    profilePhoto: String,
    portfolioUrl: String,
    linkedInUrl: String,
    githubUrl: String,
    summary: String
  },
  education: [educationSchema],
  experience: [experienceSchema],
  awards: [awardSchema],
  skills: [String],
  portfolio: [portfolioSchema],
  preferences: {
    // visibility: {
    //   type: String,
    //   enum: ['private', 'employers-only', 'public'],
    //   default: 'private'
    // },
    jobTypes: [String],
    locations: [String],
    // salaryExpectation: {
    //   min: Number,
    //   max: Number,
    //   currency: { type: String, default: 'INR' } // Default to Indian Rupees
    // }
  },
  atsScore: { type: Number, default: 0 }, // ATS score (calculated)
  isActive: { type: Boolean, default: true },
  isPrimary: { type: Boolean, default: false }, // Primary resume for quick access
}, { timestamps: true });

// Indexes for efficient queries
candidateResumeSchema.index({ candidate: 1 });
candidateResumeSchema.index({ isPrimary: 1, isActive: 1 });

const CandidateResume = mongoose.model('CandidateResume', candidateResumeSchema);

export default CandidateResume;