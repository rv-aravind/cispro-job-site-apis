// errorHandler.js
// Global error handling middleware
const errorMiddleware = (err, req, res, next) => {
    try {
        let error = { ...err };
        error.message = err.message || 'Internal Server Error';

        // Log error for debugging
        console.error("Error details:", err);

        // Handle Mongoose CastError (invalid ObjectId)
        if (err.name === 'CastError') {
            error.message = `Resource not found. Invalid: ${err.path}`;
            error.statusCode = 404;
        }

        // Handle Mongoose duplicate key error
        if (err.code === 11000) {
            error.message = `Duplicate field value entered`;
            error.statusCode = 400;
        }

        // Handle Mongoose validation error
        if (err.name === 'ValidationError') {
            error.message = Object.values(err.errors).map(val => val.message).join(', ');
            error.statusCode = 400;
        }

        // Set default status code if not specified
        const statusCode = error.statusCode || 500;

        // Send error response
        res.status(statusCode).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } catch (error) {
        // Fallback for errors in error handling
        console.error('Error in errorMiddleware:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export default errorMiddleware;