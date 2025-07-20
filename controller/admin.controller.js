// controller/admin.controller.js
import User from '../model/user.model.js';

// Admin controller object for admin and superadmin functionality
const adminController = {};

// Admin dashboard: Returns admin-specific data
adminController.getAdminDashboard = async (req, res, next) => {
    try {
        const candidatesCount = await User.countDocuments({ role: 'candidate' });
        return res.status(200).json({
            success: true,
            message: 'Admin dashboard data retrieved successfully',
            data: {
                candidatesCount,
                userId: req.user.id,
                role: req.user.role
            }
        });
    } catch (error) {
        next(error); // Pass to global error middleware
    }
};

// List all candidates: Accessible to admins and superadmins
adminController.getAllCandidates = async (req, res, next) => {
    try {
        const candidates = await User.find({ role: 'candidate' }).select('name email isActive createdAt');
        return res.status(200).json({
            success: true,
            message: 'List of candidates retrieved successfully',
            data: candidates
        });
    } catch (error) {
        next(error);
    }
};

// Superadmin dashboard: Returns superadmin-specific data
adminController.getSuperadminDashboard = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminsCount = await User.countDocuments({ role: 'admin' });
        return res.status(200).json({
            success: true,
            message: 'Superadmin dashboard data retrieved successfully',
            data: {
                totalUsers,
                adminsCount,
                userId: req.user.id
            }
        });
    } catch (error) {
        next(error);
    }
};

// List all users (including admins): Accessible only to superadmins
adminController.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('name email role isActive createdAt');
        return res.status(200).json({
            success: true,
            message: 'List of all users retrieved successfully',
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// Toggle user activation status: Accessible only to superadmins
adminController.toggleUserActivation = async (req, res, next) => {
    try {
        const userId = req.params.id;
        console.log(`Toggling activation for user ID: ${userId}`);
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Prevent superadmin from deactivating themselves
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate your own account'
            });
        }
        user.isActive = !user.isActive; // Toggle activation status
        await user.save();
        return res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { id: user._id, isActive: user.isActive }
        });
    } catch (error) {
        next(error);
    }
};

export default adminController;