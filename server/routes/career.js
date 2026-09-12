const express = require('express');
const { getRecommendations, selectCareer, getCareerProfile } = require('../controllers/careerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/recommend', getRecommendations);
router.post('/select', selectCareer);
router.get('/profile', getCareerProfile);

module.exports = router;
