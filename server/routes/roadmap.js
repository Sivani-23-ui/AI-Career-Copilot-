const express = require('express');
const { generateRoadmap, getRoadmap, toggleTaskComplete } = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/generate', generateRoadmap);
router.get('/', getRoadmap);
router.put('/task/:taskId/complete', toggleTaskComplete);

module.exports = router;
