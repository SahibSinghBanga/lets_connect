const ErrorResponse = require('../utils/errorResponse');
const request = require("request");
const asyncHandler = require('../middlewares/async');

const Profile = require('../models/Profile');
const Post = require('../models/Post');
const User = require('../models/User');

/**
 * @desc    Get all profiles
 * @route   GET api/profile
 * @access  Public
**/
exports.getProfiles = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

/**
 * @desc    Get profile by user id
 * @route   GET api/profile/user/:user_id
 * @access  Public
**/
exports.getProfile = asyncHandler(async (req, res, next) => {
    
    const profile = await Profile.findOne({ user: req.params.user_id}).populate({
        path: 'User',
        select: 'name email'
    });

    if(!profile) {
        return next(new ErrorResponse(`Profile not found with the id ${req.params.user_id}`, 404));
    }

    res.status(200).json({ 
        success: true,
        data: profile
     });

});

/**
 * @desc    Get current logged in user profile
 * @route   GET api/profile/me
 * @access  Private
**/
exports.getLoggedInUserProfile = asyncHandler(async (req, res, next) => {
    
    const profile = await Profile.findOne({user: req.user.id}).populate("User", ["name"]);
  
    if (!profile) {
        return next(new ErrorResponse(`Profile not found with the id ${req.user.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: profile
    });
});

/**
 * @desc    Create or Update user profile
 * @route   POST api/profile
 * @access  Private
**/
exports.createOrUpdateProfile = asyncHandler(async (req, res, next) => {

    // Extracting the form fields from request
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
      } = req.body;
  
    // Based on them, Building a profileFields object
    const profileFields = {};

    profileFields.user = req.user.id;

    // Check if any one them is present in the request, so add them in profileFields obj else not
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    // Skills entered as comma-seperated values store as an array in DB
    if (skills) {
    profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
  
    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    let profile = await Profile.findOne({ user: req.user.id });

    // If Profile already exist, Update It
    if (profile) {

        // Update
        profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
        );

        res.status(200).json({
            success: true,
            data: profile
        });
    } else {
        // On Else Part Create New Profile
        profile = new Profile(profileFields);

        await profile.save();
        
        res.status(200).json({
            success: true,
            data: profile
        });
    }

});

/**
 * @desc    Delete Profile, and associated User & Posts of logged_in user
 * @route   DELETE api/profile
 * @access  Private
**/
exports.deleteProfile = asyncHandler(async (req, res, next) => {

    // Remove Posts Related To User
    await Post.deleteMany({ user: req.user.id });

    // Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).json({
        success: true,
        data: {},
        message: "Profile Deleted!"
    });

});

/**
 * @desc    Add profile experience
 * @route   PUT api/profile/experience
 * @access  Private
**/
exports.addOrUpdateExperience = asyncHandler(async (req, res, next) => {
    
    // Extracting the form fields from request
    const {
        title, 
        company, 
        location,
        from,
        to,
        current,
        description
    } = req.body;

    // Based on them, Building a newExp object
    const newExp = {
        title, 
        company, 
        location,
        from,
        to,
        current,
        description
    }

    const profile = await Profile.findOne({ user: req.user.id });

    profile.experience.unshift(newExp);

    await profile.save();

    res.status(200).json({
        success: true,
        data: profile,
    });

});

/**
 * @desc    Delete experience from profile
 * @route   DELETE api/profile/experience/:exp_id
 * @access  Private
**/
exports.deleteExperience = asyncHandler(async (req, res, next) => {
    
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.status(200).json({
        success: true,
        data: {},
        message: "Experience Deleted!"
    });

});

/**
 * @desc    Add profile education
 * @route   PUT api/profile/education
 * @access  Private
**/
exports.addOrUpdateEducation = asyncHandler(async (req, res, next) => {
    
    // Extracting the form fields from request
    const {
        school, 
        degree, 
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    // Based on them, Building a newEdu object
    const newEdu = {
        school, 
        degree, 
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    const profile = await Profile.findOne({ user: req.user.id });

    profile.education.unshift(newEdu);

    await profile.save();

    res.status(200).json({
        success: true,
        data: profile
    });
});

/**
 * @desc    Delete education from profile
 * @route   DELETE api/profile/education/:edu_id
 * @access  Private
**/
exports.deleteEducation = asyncHandler(async (req, res, next) => {
    
    const profile = await Profile.findOne({ user: req.user.id });

    // Get remove index
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.status(200).json({
        success: true,
        data: {},
        message: "Education Deleted!"
    });

});

/**
 * @desc    Get user repos from github
 * @route   DELETE api/profile/github/:username
 * @access  Public
**/
exports.gitHubRepos = asyncHandler(async (req, res, next) => {
    
    const options = {
        uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GitHubClientId}&client_secret=${process.env.githubSecret}`,
        method: 'GET',
        headers: { 'user-agent': 'node.js'}
    };

    request(options, (error, response, body) => {
        if(error) console.error(error);

        if(response.statusCode !== 200) {
            return next(new ErrorResponse(`GitHub Profile Not Found`, 400));
        }

        res.status(200).json({
            success: true,
            data: JSON.parse(body),
        });
    }); 
});