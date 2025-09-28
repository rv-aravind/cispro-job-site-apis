import mongoose from "mongoose";
import Application from '../model/jobApply.model.js';
import JobPost from '../model/jobs.model.js';
import CandidateProfile from '../model/candidateProfile.model.js';
import User from '../model/user.model.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';

const employerApplicantsController = {};

/**
 * Get all applicants for a specific job with filters.
 * @param {Object} req - Request object with query params
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
employerApplicantsController.getApplicantsByJob = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.jobId;
    const { status, dateRange, page = 1, limit = 10, search } = req.query;

    // Validate job ownership
    const jobPost = await JobPost.findById(jobId);
    if (!jobPost || jobPost.employer.toString() !== employerId.toString()) {
      throw new ForbiddenError('You do not have permission to view applicants for this job');
    }

    // Build query
    let query = { jobPost: jobId };
    if (status && status !== 'All') {
      query.status = status; // 'Pending', 'Reviewed', 'Accepted', 'Rejected'
    }
    // Date range filter (e.g., "Last 12 Months")
    if (dateRange && dateRange !== 'All') {
      const months = { 'Last 12 Months': 12, 'Last 16 Months': 16, 'Last 24 Months': 24, 'Last 5 year': 60 };
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - (months[dateRange] || 12));
      query.createdAt = { $gte: cutoffDate };
    }

    // Search by candidate name or email
    if (search) {
      query.$or = [
        { 'candidate.name': { $regex: search, $options: 'i' } },
        { 'candidate.email': { $regex: search, $options: 'i' } },
        { 'candidateProfile.fullName': { $regex: search, $options: 'i' } },
        { 'candidateProfile.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Count total applicants for pagination
    const total = await Application.countDocuments(query);

    // Fetch applicants with population
    const applicants = await Application.find(query)
      .populate('candidate', 'name email phone profilePhoto')
      .populate('candidateProfile', 'fullName jobTitle phone location profilePhoto resume expectedSalary categories')
      .populate('jobPost', 'title companyProfile')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get status counts for tabs
    const statusCounts = await Application.aggregate([
      { $match: { jobPost: new mongoose.Types.ObjectId(jobId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts = {
      Total: total,
      Pending: statusCounts.find(s => s._id === 'Pending')?.count || 0,
      Reviewed: statusCounts.find(s => s._id === 'Reviewed')?.count || 0,
      Accepted: statusCounts.find(s => s._id === 'Accepted')?.count || 0,
      Rejected: statusCounts.find(s => s._id === 'Rejected')?.count || 0,
    };

    // Format applicants for frontend
    const formattedApplicants = applicants.map(app => ({
      id: app.candidate._id,
      name: app.candidateProfile?.fullName || app.candidate.name,
      designation: app.candidateProfile?.jobTitle || 'N/A',
      location: app.candidateProfile?.location?.city || 'N/A',
      expectedSalary: app.candidateProfile?.expectedSalary || 'N/A',
      tags: app.candidateProfile?.categories || [],
      avatar: app.candidateProfile?.profilePhoto || app.candidate.profilePhoto || '/default-avatar.jpg',
      status: app.status,
      appliedAt: app.createdAt,
      resume: app.resume,
      applicationId: app._id,
    }));

    return res.status(200).json({
      success: true,
      applicants: formattedApplicants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
      statusCounts: counts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update applicant status (approve/reject).
 * @param {Object} req - Request object with status
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
employerApplicantsController.updateApplicantStatus = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const applicationId = req.params.applicationId;
    const { status } = req.body; // 'Reviewed', 'Accepted', 'Rejected'

    if (!['Reviewed', 'Accepted', 'Rejected'].includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    const application = await Application.findById(applicationId).populate('jobPost');
    if (!application || application.jobPost.employer.toString() !== employerId.toString()) {
      throw new ForbiddenError('You do not have permission to update this application');
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Applicant status updated to ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an application.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
employerApplicantsController.deleteApplicant = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const applicationId = req.params.applicationId;

    const application = await Application.findById(applicationId).populate('jobPost');
    if (!application || application.jobPost.employer.toString() !== employerId.toString()) {
      throw new ForbiddenError('You do not have permission to delete this application');
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
 * Get applicant details for viewing.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
employerApplicantsController.viewApplicant = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const applicationId = req.params.applicationId;

    const application = await Application.findById(applicationId)
      .populate('candidate', 'name email phone profilePhoto')
      .populate('candidateProfile', 'fullName jobTitle phone location profilePhoto resume expectedSalary categories')
       .populate({
          path: 'jobPost',
          select: 'title employer'
        })
      .select('-__v');

    if (!application || application.jobPost.employer.toString() !== employerId.toString()) {
      throw new ForbiddenError('You do not have permission to view this application');
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update applicant statuses.
 * @param {Object} req - Request object with application IDs and status
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
employerApplicantsController.bulkUpdateStatus = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const { applicationIds, status } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      throw new BadRequestError('Application IDs array is required');
    }

    if (!['Reviewed', 'Accepted', 'Rejected'].includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    // Find applications belonging to the employer
    const applications = await Application.find({
      _id: { $in: applicationIds },
      'jobPost.employer': employerId,
    });

    if (applications.length !== applicationIds.length) {
      throw new ForbiddenError('Some applications do not belong to you');
    }

    // Update statuses
    await Application.updateMany(
      { _id: { $in: applicationIds } },
      { $set: { status } }
    );

    return res.status(200).json({
      success: true,
      message: `${applications.length} applications updated to ${status}`,
      updatedCount: applications.length,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Shortlist an applicant for a job.
 * @route PUT /api/employer/applications/:applicationId/shortlist
 * @access Private (Employer, Admin, Superadmin)
 */
employerApplicantsController.shortlistApplicant = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const applicationId = req.params.applicationId;

    const application = await Application.findById(applicationId)
      .populate('jobPost')
      .populate('candidate', 'email');
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    //check if the job belongs to the employer
    if (application.jobPost.employer.toString() !== employerId.toString()) {
      throw new ForbiddenError('You do not have permission to shortlist this applicant');
    }
    console.log("Shortlisting application:", application);
    
    application.shortlisted = true;
    await application.save();

    // Notify candidate (assuming sendEmail is defined)
    // const job = await JobPost.findById(application.jobPost).populate('companyProfile', 'companyName');
    // await sendEmail({
    //   to: application.candidate.email,
    //   subject: 'Your Application Has Been Shortlisted!',
    //   text: `Your application for ${job.title} at ${job.companyProfile.companyName} has been shortlisted.`,
    // });

    return res.status(200).json({
      success: true,
      message: 'Applicant shortlisted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Remove an applicant from shortlist.
 * @route PUT /api/employer/applications/:applicationId/unshortlist
 * @access Private (Employer, Admin, Superadmin)
 */
employerApplicantsController.unshortlistApplicant = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const applicationId = req.params.applicationId;

    const application = await Application.findById(applicationId).populate('jobPost');
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    if (application.jobPost.employer.toString() !== employerId.toString()) {
      throw new ForbiddenError('You do not have permission to unshortlist this applicant');
    }

    application.shortlisted = false;
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Applicant removed from shortlist',
      application,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get shortlisted resumes for a job or all jobs by employer.
 * @route GET /api/employer/shortlisted-resumes?jobId=ID&status=Pending&search=John&page=1&limit=10
 * @access Private (Employer, Admin, Superadmin)
 */
employerApplicantsController.getShortlistedResumes = async (req, res, next) => {
  try {
    const employerId = req.user.id;
    const { jobId, status, dateRange, page = 1, limit = 10, search } = req.query;

    // Build query
    let query = { shortlisted: true };

    // Filter by jobId if provided
    if (jobId) {
      const jobPost = await JobPost.findById(jobId);
      if (!jobPost || jobPost.employer.toString() !== employerId.toString()) {
        throw new ForbiddenError('You do not have permission to view shortlisted resumes for this job');
      }
      query.jobPost = jobId;
    } else {
      // Fetch job posts by employer to limit applications to their jobs
      const employerJobs = await JobPost.find({ employer: employerId }).select('_id');
      query.jobPost = { $in: employerJobs.map(job => job._id) };
    }

    if (status && status !== 'All') {
      query.status = status;
    }
    if (dateRange && dateRange !== 'All') {
      const months = { 'Last 12 Months': 12, 'Last 16 Months': 16, 'Last 24 Months': 24, 'Last 5 year': 60 };
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - (months[dateRange] || 12));
      query.createdAt = { $gte: cutoffDate };
    }
    if (search) {
      query.$or = [
        { 'candidate.name': { $regex: search, $options: 'i' } },
        { 'candidate.email': { $regex: search, $options: 'i' } },
        { 'candidateProfile.fullName': { $regex: search, $options: 'i' } },
        { 'candidateProfile.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Count total shortlisted resumes for pagination
    const total = await Application.countDocuments(query);

    // Fetch shortlisted applications
    const applicants = await Application.find(query)
      .populate('candidate', 'name email phone profilePhoto')
      .populate('candidateProfile', 'fullName jobTitle phone location profilePhoto resume expectedSalary categories')
      .populate('jobPost', 'title companyProfile')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get status counts for tabs
    const statusCounts = await Application.aggregate([
      { $match: { ...query, shortlisted: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const counts = {
      Total: total,
      Pending: statusCounts.find(s => s._id === 'Pending')?.count || 0,
      Reviewed: statusCounts.find(s => s._id === 'Reviewed')?.count || 0,
      Accepted: statusCounts.find(s => s._id === 'Accepted')?.count || 0,
      Rejected: statusCounts.find(s => s._id === 'Rejected')?.count || 0,
    };

    // Format applicants for frontend
    const formattedApplicants = applicants.map(app => ({
      id: app.candidate._id,
      name: app.candidateProfile?.fullName || app.candidate.name,
      designation: app.candidateProfile?.jobTitle || 'N/A',
      location: app.candidateProfile?.location?.city || 'N/A',
      hourlyRate: app.candidateProfile?.expectedSalary || 'N/A',
      tags: app.candidateProfile?.categories || [],
      avatar: app.candidateProfile?.profilePhoto || app.candidate.profilePhoto || '/default-avatar.jpg',
      status: app.status,
      shortlisted: app.shortlisted,
      appliedAt: app.createdAt,
      resume: app.resume,
      applicationId: app._id,
      jobTitle: app.jobPost?.title || 'N/A',
    }));

    return res.status(200).json({
      success: true,
      applicants: formattedApplicants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit),
      },
      statusCounts: counts,
    });
  } catch (error) {
    next(error);
  }
};


export default employerApplicantsController;