const RegistrationModel = require('../models/registrationModel');
const EventModel = require('../models/eventModel');

// Users register for events; capacity and duplicate checks happen here.
async function registerForEvent(req, res, next) {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: 'eventId is required' });

    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const currentCount = await RegistrationModel.countForEvent(eventId);
    if (currentCount >= event.max_participants) {
      return res.status(400).json({ message: 'This event is full' });
    }

    const registrationId = await RegistrationModel.create({
      userId: req.user.id,
      eventId,
      // Always 'paid': this is a sandbox/test-mode payment gateway (per
      // the brief), so there's no real processor to verify against.
      // A registration is only ever created after the frontend's fake
      // payment step succeeds (or immediately, for free events) — see
      // public/js/event-details.js.
      paymentStatus: 'paid'
    });

    res.status(201).json({ message: 'Registered successfully', registrationId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    next(err);
  }
}

// "View Registered Events" — a user's own list.
async function getMyRegistrations(req, res, next) {
  try {
    res.json(await RegistrationModel.findByUser(req.user.id));
  } catch (err) {
    next(err);
  }
}

// "View Participants" — a manager's own event only.
async function getEventParticipants(req, res, next) {
  try {
    const event = await EventModel.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.manager_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only view participants for your own events' });
    }
    res.json(await RegistrationModel.findByEventForManager(req.params.eventId));
  } catch (err) {
    next(err);
  }
}

module.exports = { registerForEvent, getMyRegistrations, getEventParticipants };
