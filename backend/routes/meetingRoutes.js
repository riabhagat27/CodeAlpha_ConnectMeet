const express = require('express');
const router = express.Router();
const { createMeeting, getMeetings, getMeetingByCode, deleteMeeting } = require('../controllers/meetingController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/:code', getMeetingByCode);
router.delete('/:code', deleteMeeting);

module.exports = router;
