const express = require('express');
const { analyzeSkills } = require('../controllers/skillsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeSkills);

module.exports = router;
