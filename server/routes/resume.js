const express = require('express');
const multer = require('multer');
const { analyzeResume, getLatestResume, uploadAndAnalyze } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Memory storage — we only need the buffer for pdf-parse
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  },
});

router.use(protect);

router.post('/analyze', analyzeResume);
router.post('/upload', upload.single('resume'), uploadAndAnalyze);
router.get('/latest', getLatestResume);

module.exports = router;
