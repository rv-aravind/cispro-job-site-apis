import mongoose from "mongoose";
import CandidateProfile from "../model/candidateProfile.model.js";
import jobs from '../model/jobs.model.js';
import JobApply from "../model/jobApply.model.js";
import SavedJob from '../model/savedJob.model.js';
import { ForbiddenError, BadRequestError, NotFoundError } from "../utils/errors.js";
import fs from 'fs';
import path from 'path';

const candidateController = {};

/**
 * Retrieves all candidate profiles (accessible to admins and superadmins)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
candidateController.getAllCandidateProfiles = async (req, res, next) => {
  try {
    // Fetch all candidate profiles, excluding the version key
    const profiles = await CandidateProfile.find().select('-__v');
    return res.status(200).json({
      success: true,
      profiles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a candidate profile for an authenticated candidate
 * @param {Object} req - Request object containing candidate data
 * @param {Object} res - Response object to send back the result
 * @param {Function} next - Next middleware function
 */
candidateController.createCandidateProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    // Use req.body directly (normalized by middleware)
    const profileData = req.body;

    const { 
      fullName, jobTitle, phone, email, website, currentSalary, expectedSalary, experience, age, educationLevels, languages, categories, allowInSearch, description, socialMedia, location
    } = profileData;

    // Validate required fields
    const requiredFields = ['fullName', 'jobTitle', 'phone', 'email', 'educationLevels', 'languages', 'categories', 'description', 'age', 'location'];
    const missingFields = requiredFields.filter(field => !profileData[field] || (field === 'location' && (!profileData[field].city || !profileData[field].completeAddress)));
    if (missingFields.length > 0) {
      throw new BadRequestError(`Missing or incomplete required fields: ${missingFields.join(', ')}`);
    }

    // Check if profile already exists
    const existingProfile = await CandidateProfile.findOne({ candidate: candidateId });
    if (existingProfile) {
      throw new BadRequestError('Candidate profile already exists for this user');
    }

    // Handle file uploads
    const files = req.files || {};
    const profilePhoto = files.profilePhoto ? `/uploads/candidate/${files.profilePhoto[0].filename}` : null;
    const resume = files.resume ? `/uploads/candidate/${files.resume[0].filename}` : null;

    // Create new profile
    const newProfile = new CandidateProfile({
      candidate: candidateId,
      fullName,
      jobTitle,
      phone,
      email,
      website,
      currentSalary,
      expectedSalary,
      experience,
      age,
      educationLevels: Array.isArray(educationLevels) ? educationLevels : (typeof educationLevels === 'string' ? JSON.parse(educationLevels) : [educationLevels]),
      languages: Array.isArray(languages) ? languages : (typeof languages === 'string' ? JSON.parse(languages) : [languages]),
      categories: Array.isArray(categories) ? categories : (typeof categories === 'string' ? JSON.parse(categories) : [categories]),
      allowInSearch: allowInSearch !== undefined ? allowInSearch : true,
      description,
      socialMedia: typeof socialMedia === 'object' ? socialMedia : (socialMedia ? JSON.parse(socialMedia) : {}),
      location: typeof location === 'object' ? location : (location ? JSON.parse(location) : {}),
      profilePhoto,
      resume
    });

    // console.log("Creating candidate profile with data:", newProfile);
    

    await newProfile.save();

    return res.status(201).json({
      success: true,
      message: 'Candidate profile created successfully',
      profile: newProfile
    });
  } catch (error) {
    // Cleanup uploaded files if an error occurs after upload
    if (req.files) {
      const files = req.files;
      if (files.profilePhoto && files.profilePhoto[0]) {
        const photoPath = path.join(process.cwd(), 'public', `/uploads/candidate/${files.profilePhoto[0].filename}`);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }
      if (files.resume && files.resume[0]) {
        const resumePath = path.join(process.cwd(), 'public', `/uploads/candidate/${files.resume[0].filename}`);
        if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
      }
    }

    next(error);
  }
};

/**
 * Updates a candidate profile for an authenticated candidate
 * @param {Object} req - Request object containing candidate data
 * @param {Object} res - Response object to send back the result
 * @param {Function} next - Next middleware function
 */
candidateController.updateCandidateProfile = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const profileId = req.params.id;

    // Parse the nested data from req.body.data
    let profileData = req.body;

    const { 
      fullName, jobTitle, phone, email, website, currentSalary, expectedSalary, experience, age, educationLevels, languages, categories, allowInSearch, description, socialMedia, location
    } = profileData;

    // Find the profile by ID
    const profile = await CandidateProfile.findById(profileId);
    if (!profile) {
      throw new NotFoundError('Candidate profile not found');
    }

    // Check permissions
    if (req.user.role !== 'superadmin' && profile.candidate.toString() !== candidateId.toString()) {
      throw new ForbiddenError('You do not have permission to update this profile');
    }

    // Handle file uploads
    const files = req.files || {};
    if (files.profilePhoto) {
      // Delete old photo if exists
      if (profile.profilePhoto) {
        const oldPhotoPath = path.join(process.cwd(), 'public', profile.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) fs.unlinkSync(oldPhotoPath);
      }
      profile.profilePhoto = `/uploads/candidate/${files.profilePhoto[0].filename}`;
    }
    if (files.resume) {
      // Delete old resume if exists
      if (profile.resume) {
        const oldResumePath = path.join(process.cwd(), 'public', profile.resume);
        if (fs.existsSync(oldResumePath)) fs.unlinkSync(oldResumePath);
      }
      profile.resume = `/uploads/candidate/${files.resume[0].filename}`;
    }

    // Update fields if provided
    profile.fullName = fullName || profile.fullName;
    profile.jobTitle = jobTitle || profile.jobTitle;
    profile.phone = phone || profile.phone;
    profile.email = email || profile.email;
    profile.website = website || profile.website;
    profile.currentSalary = currentSalary || profile.currentSalary;
    profile.expectedSalary = expectedSalary || profile.expectedSalary;
    profile.experience = experience || profile.experience;
    profile.age = age || profile.age;
    // Normalize arrays (support repeated form-data keys or JSON string arrays)
    profile.educationLevels = educationLevels
      ? (Array.isArray(educationLevels)
          ? educationLevels
          : (typeof educationLevels === "string" ? JSON.parse(educationLevels) : [educationLevels]))
      : profile.educationLevels;

    profile.languages = languages
      ? (Array.isArray(languages)
          ? languages
          : (typeof languages === "string" ? JSON.parse(languages) : [languages]))
      : profile.languages;

    profile.categories = categories
      ? (Array.isArray(categories)
          ? categories
          : (typeof categories === "string" ? JSON.parse(categories) : [categories]))
      : profile.categories;
    profile.allowInSearch = allowInSearch !== undefined ? allowInSearch : profile.allowInSearch;
    profile.description = description || profile.description;
    profile.socialMedia = typeof socialMedia === 'string' ? JSON.parse(socialMedia) : (socialMedia || profile.socialMedia);
    profile.location = typeof location === 'string' ? JSON.parse(location) : (location || profile.location);

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully',
      profile
    });
  } catch (error) {
    // Cleanup uploaded files if an error occurs after upload
    if (req.files) {
      const files = req.files;
      if (files.profilePhoto && files.profilePhoto[0]) {
        const photoPath = path.join(process.cwd(), 'public', `/uploads/candidate/${files.profilePhoto[0].filename}`);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
      }
      if (files.resume && files.resume[0]) {
        const resumePath = path.join(process.cwd(), 'public', `/uploads/candidate/${files.resume[0].filename}`);
        if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
      }
    }
    next(error);
  }
};

/**
 * Retrieves a single candidate profile by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
candidateController.getCandidateProfile = async (req, res, next) => {
  try {
    const profileId = req.params.id;
    const profile = await CandidateProfile.findById(profileId).select('-__v');
    if (!profile) {
      throw new NotFoundError('Candidate profile not found');
    }

    // Check permissions
    if (req.user.role !== 'superadmin' && profile.candidate.toString() !== req.user.id.toString()) {
      throw new ForbiddenError('You do not have permission to access this profile');
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a candidate profile by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
candidateController.deleteCandidateProfile = async (req, res, next) => {
  try {
    const profileId = req.params.id;
    const profile = await CandidateProfile.findById(profileId);
    if (!profile) {
      throw new NotFoundError('Candidate profile not found');
    }

    // Check permissions
    if (req.user.role !== 'superadmin' && profile.candidate.toString() !== req.user.id.toString()) {
      throw new ForbiddenError('You do not have permission to delete this profile');
    }

    // Delete associated files
    if (profile.profilePhoto) {
      const photoPath = path.join(process.cwd(), 'public', profile.profilePhoto);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }
    if (profile.resume) {
      const resumePath = path.join(process.cwd(), 'public', profile.resume);
      if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
    }

    await CandidateProfile.findByIdAndDelete(profileId);

    return res.status(200).json({
      success: true,
      message: 'Candidate profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Retrieves all published job posts for candidates to view
 * @route GET /api/candidate/jobs
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
candidateController.getAllJobPosts = async (req, res, next) => {
  try {
    const jobPosts = await jobs.find({ status: 'Published' })
      .populate('companyProfile', 'companyName logo') // Populate company name and logo
      .select('-__v -applicantCount') // Hide internal fields
      .sort({ createdAt: -1 }); // Sort by newest first

    return res.status(200).json({
      success: true,
      jobPosts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Applies to a specific job post
 * @route POST /api/candidate/jobs/:jobId/apply
 * @access Private (Candidate only)
 * @param {Object} req - Express request object (should include candidate and optional file)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
candidateController.applyToJob = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const jobPostId = req.params.jobId;
    const { description, coverLetter } = req.body;
    const files = req.files || {};

    // Ensure job post exists and is published
    const jobPost = await jobs.findById(jobPostId);
    if (!jobPost || jobPost.status !== 'Published') {
      throw new NotFoundError('Job post not found or not available');
    }

    // Ensure candidate has a profile
    const candidateProfile = await CandidateProfile.findOne({ candidate: candidateId });
    console.log("test", candidateProfile);
    
    if (!candidateProfile) {
      throw new BadRequestError('Please create a candidate profile before applying');
    }
    console.log("Candidate profile found:", candidateProfile);
    
    // Prevent duplicate applications
    const existingApplication = await JobApply.findOne({ jobPost: jobPostId, candidate: candidateId });
    if (existingApplication) {
      throw new BadRequestError('You have already applied to this job');
    }

    // Application message is required
    if (!description) {
      throw new BadRequestError('Application message (description) is required');
    }

    // Get resume either from profile or from uploaded file
    let resume = candidateProfile.resume;
    if (!resume && !files.resume) {
      throw new BadRequestError('Resume is required. Please upload a resume in your profile or with this application');
    } else if (files.resume) {
      // Set uploaded resume path
      resume = `/uploads/candidate/${files.resume[0].filename}`;
    }

    // Create new application
    const newApplication = new JobApply({
      jobPost: jobPostId,
      candidate: candidateId,
      resume,
      coverLetter,
      description,
    });

    await newApplication.save();

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: newApplication,
    });
  } catch (error) {
    // Cleanup uploaded file if there’s an error
    if (req.files?.resume?.[0]) {
      const resumePath = path.join(process.cwd(), 'public', `/uploads/candidate/${req.files.resume[0].filename}`);
      if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
    }
    next(error);
  }
};

/**
 * Saves (bookmarks) a job post for later
 * @route POST /api/candidate/jobs/:jobId/save
 * @access Private (Candidate only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
candidateController.saveJob = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const jobPostId = req.params.jobId;

    // Ensure job post exists
    const jobPost = await jobs.findById(jobPostId);
    if (!jobPost) {
      throw new NotFoundError('Job post not found');
    }

    // Prevent duplicate saves
    const existingSave = await SavedJob.findOne({ jobPost: jobPostId, candidate: candidateId });
    if (existingSave) {
      throw new BadRequestError('You have already saved this job');
    }

    const newSave = new SavedJob({
      jobPost: jobPostId,
      candidate: candidateId,
    });

    await newSave.save();

    return res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      savedJob: newSave,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all jobs the candidate has applied to
 * @route GET /api/candidate/applied-jobs
 * @access Private (Candidate only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
candidateController.getAppliedJobs = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const appliedJobs = await JobApply.find({ candidate: candidateId })
      .populate({
        path: 'jobPost',
        populate: { path: 'companyProfile', select: 'companyName logo' },
        select: '-__v',
      })
      .select('-__v')
      .sort({ createdAt: -1 }); // Latest applications first

    return res.status(200).json({
      success: true,
      appliedJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves all saved jobs for a candidate
 * @route GET /api/candidate/saved-jobs
 * @access Private (Candidate only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
candidateController.getSavedJobs = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    const savedJobs = await SavedJob.find({ candidate: candidateId })
      .populate({
        path: 'jobPost',
        populate: { path: 'companyProfile', select: 'companyName logo' },
        select: '-__v',
      })
      .select('-__v')
      .sort({ createdAt: -1 }); // Latest saved first

    return res.status(200).json({
      success: true,
      savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes an application (unapply from a job)
 * @route DELETE /api/candidate/applied-jobs/:applicationId
 * @access Private (Candidate only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
candidateController.deleteAppliedJob = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const applicationId = req.params.applicationId;

    const application = await JobApply.findById(applicationId);
    // Ensure application exists and belongs to candidate
    if (!application || application.candidate.toString() !== candidateId) {
      throw new NotFoundError('Application not found or not yours');
    }

    await application.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a saved job (unsave)
 * @route DELETE /api/candidate/saved-jobs/:savedJobId
 * @access Private (Candidate only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
candidateController.deleteSavedJob = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const savedJobId = req.params.savedJobId;

    const savedJob = await SavedJob.findById(savedJobId);
    // Ensure saved job exists and belongs to candidate
    if (!savedJob || savedJob.candidate.toString() !== candidateId.toString()) {
      throw new NotFoundError('Saved job not found or not yours');
    }

    await savedJob.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Saved job deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};


export default candidateController;