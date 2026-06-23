const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { uploadEventMedia } = require('../middleware/upload');

// @route   GET /api/events
// @desc    Get all events
router.get('/', async (req, res) => {
  try {
    const { category, upcoming, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };
    if (category) query.category = category;
    if (upcoming === 'true') query.date = { $gte: new Date() };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email profilePic')
      .sort({ date: 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ events, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event with full media
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePic')
      .populate('mediaContributions.user', 'name profilePic');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create an event — any logged-in user
router.post('/', auth, uploadEventMedia.single('bannerImage'), async (req, res) => {
  try {
    const eventData = { ...req.body, organizer: req.user._id };
    if (req.file) eventData.bannerImage = req.file.path;

    const event = new Event(eventData);
    await event.save();
    await event.populate('organizer', 'name email profilePic');
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events/:id/media
// @desc    Add photo/video contribution to an event — any logged-in user
router.post('/:id/media', auth, uploadEventMedia.single('media'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    event.mediaContributions.push({
      user: req.user._id,
      mediaType,
      url: req.file.path,
      publicId: req.file.filename,
      caption: req.body.caption || '',
    });

    await event.save();
    await event.populate('mediaContributions.user', 'name profilePic');

    res.status(201).json({ message: 'Media uploaded successfully', event });
  } catch (error) {
    console.error('Media upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id/register
// @desc    Register for an event
router.put('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const alreadyRegistered = event.attendees.some(
      att => att.user.toString() === req.user._id.toString()
    );
    if (alreadyRegistered) return res.status(400).json({ message: 'Already registered for this event' });

    if (event.maxAttendees > 0 && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.attendees.push({ user: req.user._id });
    await event.save();
    res.json({ message: 'Registered successfully', attendees: event.attendees.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event (organizer or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isOrganizer = event.organizer.toString() === req.user._id.toString();
    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
