const express = require('express');
const router = express.Router();
const {
  registerForEvent, getMyRegistrations, getEventParticipants
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('user'), registerForEvent);
router.get('/mine', protect, authorize('user'), getMyRegistrations);
router.get('/event/:eventId', protect, authorize('manager'), getEventParticipants);

module.exports = router;
