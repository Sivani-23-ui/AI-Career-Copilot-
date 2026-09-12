const express = require('express');
const { recommendCourses } = require('../controllers/coursesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/recommend', recommendCourses);

module.exports = router;
