import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+91\d{10}$/, 'Please enter a valid Indian phone number (e.g., +919876543210)'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/, 'Please enter a valid URL'],
  },
  currentSalary: {
    type: String,
    enum: ['< ₹5 LPA', '₹5-10 LPA', '₹10-15 LPA', '₹15-20 LPA', '₹20-30 LPA', '₹30+ LPA'],
  },
  expectedSalary: {
    type: String,
    enum: ['< ₹5 LPA', '₹5-10 LPA', '₹10-15 LPA', '₹15-20 LPA', '₹20-30 LPA', '₹30+ LPA'],
  },
  experience: {
    type: String,
    required: [false, 'Experience is required'],
    enum: ['Fresher', '1-2 years', '2-5 years', '5-10 years', '10+ years'],
  },
  age: {
    type: Number,
    min: 18,
    max: 65,
    required: [true, 'Age is required'],
  },
  educationLevels: {
    type: [String],
    required: [true, 'Education levels are required'],
    enum: [ '10th', '12th', 'Diploma', 'Bachelor', 'Master', 'Doctorate', 'Other' ],
    // enum: ['High School', 'Diploma', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Certification'],
  },
  languages: {
    type: [String],
    required: [true, 'Languages are required'],
    enum: ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Other'],
    // default: [],
  },
  categories: {
    type: [String],
    required: [true, 'Categories are required'],
  },
  allowInSearch: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  socialMedia: {
    facebook: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
  },
  location: {
    country: { type: String, default: 'India', trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    completeAddress: { type: String, required: [true, 'Complete address is required'], trim: true },
  },
  profilePhoto: {
    type: String,
    trim: true,
  },
  resume: {
    type: String,
    trim: true,
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Define indexes explicitly
candidateProfileSchema.index({ candidate: 1 }, { unique: true });
candidateProfileSchema.index({ email: 1 }, { unique: true });
candidateProfileSchema.index({ jobTitle: 'text', description: 'text' });

const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);

export default CandidateProfile;