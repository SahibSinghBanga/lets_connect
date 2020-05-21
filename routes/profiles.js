const express = require('express');
const {
  getProfiles,
  getProfile,
  getLoggedInUserProfile,
  createOrUpdateProfile,
  deleteProfile,
  addOrUpdateExperience,
  deleteExperience,
  addOrUpdateEducation,
  deleteEducation,
  gitHubRepos
} = require('../controllers/profiles');

const Profile = require('../models/Profile');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

router
  .route("/")
  .get(advancedResults(Profile), getProfiles)
  .post(protect, createOrUpdateProfile)
  .delete(protect, deleteProfile);  

router
  .route('/me')
  .get(protect, getLoggedInUserProfile);

router
  .route('/user/:user_id')
  .get(getProfile)  

router
  .route('/experience')
  .put(protect, addOrUpdateExperience) 
  
router
  .route('/experience/:exp_id')
  .delete(protect, deleteExperience) 
  
router
  .route('/education')
  .put(protect, addOrUpdateEducation)  

router
  .route('/education/:edu_id')
  .delete(protect, deleteEducation)
  
router
  .route('/github/:username')
  .get(gitHubRepos)   

module.exports = router;    