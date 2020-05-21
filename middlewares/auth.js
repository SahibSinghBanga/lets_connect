const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        // Set token from bearer token
        token = req.headers.authorization.split(" ")[1];
    } 

    // Set token from Cookie
    // Option For Adding Cookie
    // If no bearer token, this cookie will be used in the protected routes
    // else if(req.cookies.token) {
        
    //     token = req.cookies.token;
    // }


    // Make sure token exists in either req or cookie
    if(!token) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }

    // If it token does exists
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id); // Logged in user ( always )

        next();
    } catch (err) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    }
}