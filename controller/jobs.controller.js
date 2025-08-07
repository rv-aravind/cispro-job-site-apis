import jobs from '../model/jobs.model.js';
import CompanyProfile from '../model/companyProfile.model.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';

const jobsController = {};

/**
 * Creates a new job post for an authenticated employer
 * @param {Object} req - Request object containing job post data
 * @param {Object} res - Response object to send back the result
 * @param {Function} next - Next middleware function
 */
jobsController.createJobPost = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const {
      title,
      description,
      contactEmail,
      contactUsername,
      specialisms,
      jobType,
      offeredSalary,
      careerLevel,
      experience,
      gender,
      industry,
      qualification,
      applicationDeadline,
      location,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      'title', 'description', 'contactEmail', 'specialisms', 'jobType',
      'offeredSalary', 'careerLevel', 'experience', 'industry', 'qualification',
      'applicationDeadline', 'location'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      throw new BadRequestError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate location object
    if (!location.country || !location.city || !location.completeAddress) {
      throw new BadRequestError('Complete location details are required');
    }

    // Check if employer has a company profile
    const companyProfile = await CompanyProfile.findOne({ employer: employerId });
    if (!companyProfile) {
      throw new NotFoundError('Company profile not found. Please create a company profile first.');
    }

    // Create new job post
    const newJobPost = new jobs({
      employer: employerId,
      companyProfile: companyProfile._id,
      title,
      description,
      contactEmail,
      contactUsername,
      specialisms: Array.isArray(specialisms) ? specialisms : JSON.parse(specialisms),
      jobType,
      offeredSalary,
      careerLevel,
      experience,
      gender: gender || 'No Preference',
      industry,
      qualification,
      applicationDeadline,
      location: {
        country: location.country,
        city: location.city,
        completeAddress: location.completeAddress,
      },
      status: 'Published', // Default to Published; could be Draft if frontend supports saving drafts
    });

    await newJobPost.save();

    return res.status(201).json({
      success: true,
      message: 'Job post created successfully',
      jobPost: newJobPost,
    });
  } catch (error) {
    next(error);
  }
};



/**
 * Fetches a list of job posts, filtered by employer for non-superadmins
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
jobsController.getJobPosts = async (req, res, next) => {
  try {
    const user = req.user;
    let query = {};

    // Restrict to employer's own job posts unless superadmin
    if (user.role !== 'superadmin') {
      query.employer = user.id;
    }

    const jobPosts = await jobs.find(query)
      .populate('companyProfile', 'companyName logo')
       .select('-__v applicantCount')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      jobPosts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetches a single job post for editing
 * @param {Object} req - Request object containing job post ID
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
jobsController.getJobPost = async (req, res, next) => {
  try {
    const user = req.user;
    const jobPostId = req.params.id;

    const jobPost = await jobs.findById(jobPostId)
      .populate('companyProfile', 'companyName logo')
      .select('-__v applicantCount'); 

    if (!jobPost) {
      throw new NotFoundError('Job post not found');
    }

    // Check permissions
    if (user.role !== 'superadmin' && jobPost.employer.toString() !== user.id) {
      throw new ForbiddenError('You do not have permission to access this job post');
    }

    return res.status(200).json({
      success: true,
      jobPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates a job post
 * @param {Object} req - Request object containing updated job post data
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
jobsController.updateJobPost = async (req, res, next) => {
  try {
    const user = req.user;
    const jobPostId = req.params.id;
    const {
      title,
      description,
      contactEmail,
      contactUsername,
      specialisms,
      jobType,
      offeredSalary,
      careerLevel,
      experience,
      gender,
      industry,
      qualification,
      applicationDeadline,
      location,
      status,
    } = req.body;

    const jobPost = await jobs.findById(jobPostId);
    if (!jobPost) {
      throw new NotFoundError('Job post not found');
    }

    // Check permissions
    if (user.role !== 'superadmin' && jobPost.employer.toString() !== user.id) {
      throw new ForbiddenError('You do not have permission to update this job post');
    }

    // Parse specialisms if string
    let parsedSpecialisms = specialisms;
    if (typeof specialisms === 'string') {
      try {
        parsedSpecialisms = JSON.parse(specialisms);
      } catch {
        throw new BadRequestError('Invalid specialisms format');
      }
    }

    // Parse location if string
    let parsedLocation;
    if (typeof location === 'string') {
      try {
        parsedLocation = JSON.parse(location);
      } catch {
        throw new BadRequestError('Invalid location format');
      }
    } else {
      parsedLocation = location;
    }

    // Update fields
    const updateData = {
      title: title || jobPost.title,
      description: description || jobPost.description,
      contactEmail: contactEmail || jobPost.contactEmail,
      contactUsername: contactUsername || jobPost.contactUsername,
      specialisms: parsedSpecialisms ? (Array.isArray(parsedSpecialisms) ? parsedSpecialisms : [parsedSpecialisms]) : jobPost.specialisms,
      jobType: jobType || jobPost.jobType,
      offeredSalary: offeredSalary || jobPost.offeredSalary,
      careerLevel: careerLevel || jobPost.careerLevel,
      experience: experience || jobPost.experience,
      gender: gender || jobPost.gender,
      industry: industry || jobPost.industry,
      qualification: qualification || jobPost.qualification,
      applicationDeadline: applicationDeadline || jobPost.applicationDeadline,
      status: status || jobPost.status,
    };

    if (parsedLocation) {
      updateData.location = {
        country: parsedLocation.country || jobPost.location.country,
        city: parsedLocation.city || jobPost.location.city,
        completeAddress: parsedLocation.completeAddress || jobPost.location.completeAddress,
        coordinates: {
          latitude: parsedLocation.coordinates?.latitude ? parseFloat(parsedLocation.coordinates.latitude) : jobPost.location.coordinates.latitude,
          longitude: parsedLocation.coordinates?.longitude ? parseFloat(parsedLocation.coordinates.longitude) : jobPost.location.coordinates.longitude,
        },
      };
    }

    // Update job post
    const updatedJobPost = await jobs.findByIdAndUpdate(
      jobPostId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-__v');

    return res.status(200).json({
      success: true,
      message: 'Job post updated successfully',
      jobPost: updatedJobPost,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a job post
 * @param {Object} req - Request object containing job post ID
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
jobsController.deleteJobPost = async (req, res, next) => {
  try {
    const user = req.user;
    const jobPostId = req.params.id;

    const jobPost = await jobs.findById(jobPostId);
    if (!jobPost) {
      throw new NotFoundError('Job post not found');
    }

    // Check permissions
    if (user.role !== 'superadmin' && jobPost.employer.toString() !== user.id) {
      throw new ForbiddenError('You do not have permission to delete this job post');
    }

    // Delete job post
    await JobPost.findByIdAndDelete(jobPostId);

    return res.status(200).json({
      success: true,
      message: 'Job post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default jobsController;