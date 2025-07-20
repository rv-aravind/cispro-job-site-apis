import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  website: {
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/, 'Please enter a valid URL'],
  },
  establishedSince: {
    type: Date,
    required: [true, 'Establishment date is required'],
  },
  teamSize: {
    type: String,
    required: [true, 'Team size is required'],
    enum: ['50 - 100', '100 - 150', '200 - 250', '300 - 350', '500 - 1000'],
  },
  categories: {
    type: [String],
    required: [true, 'At least one category is required'],
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
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    googlePlus: { type: String, trim: true },
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
  },
  logo: {
    type: String,
    trim: true,
  },
  coverImage: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

export default CompanyProfile;