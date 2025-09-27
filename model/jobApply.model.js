import mongoose from 'mongoose';
import JobPost from './jobs.model.js';

const jobApplicationSchema = new mongoose.Schema({
  jobPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPost',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: String,
    trim: true,
  },
  coverLetter: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Application message is required'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

// Prevent duplicate applications
jobApplicationSchema.index({ jobPost: 1, candidate: 1 }, { unique: true });

// Hook to increment applicantCount on save
jobApplicationSchema.post('save', async function (doc) {
  try {
    await JobPost.findByIdAndUpdate(doc.jobPost, { $inc: { applicantCount: 1 } });
  } catch (error) {
    console.error('Error incrementing applicantCount:', error);
  }
});

// Hook to decrement applicantCount on delete
jobApplicationSchema.post('findOneAndDelete', async function (doc) {
  try {
    await JobPost.findByIdAndUpdate(doc.jobPost, { $inc: { applicantCount: -1 } });
  } catch (error) {
    console.error('Error decrementing applicantCount:', error);
  }
});

const Application = mongoose.model('JobApplication', jobApplicationSchema);
export default Application;