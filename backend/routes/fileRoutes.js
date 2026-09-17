const express = require('express');
const router = express.Router();
const { uploadFile, getMeetingFiles, downloadFile } = require('../controllers/fileController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/:meetingId', authMiddleware, getMeetingFiles);
router.get('/download/:id', downloadFile); // Download can be requested directly or token verified

module.exports = router;
