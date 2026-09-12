const express = require('express');
const {
  startInterview,
  submitAnswer,
  getInterviewHistory,
  getInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/start', startInterview);
router.post('/answer', submitAnswer);
router.get('/history', getInterviewHistory);
router.get('/:id', getInterview);

module.exports = router;
