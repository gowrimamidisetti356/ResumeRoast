const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { upload } = require('../controllers/resumeController');

// Main Analysis Route
router.post('/analyze', upload.single('file'), resumeController.analyzeResume);

// Advanced Features Routes
router.post('/scan', resumeController.scanResume);
router.post('/ats-score', resumeController.calculateATSScore);
router.post('/bullet-impact', resumeController.impactifyBullets);
router.post('/skill-bridge', resumeController.recommendSkills);
router.post('/analyze-match', resumeController.analyzeMatch);
router.post('/mock-interview', resumeController.generateInterviewQuestions);
router.post('/chat', resumeController.chatWithFeature);
router.get('/', resumeController.getUserResumes);

module.exports = router;
