const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  caption: { type: String, default: '' },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: { type: String, default: '' },
  location: { type: String, required: true, default: 'Online' },
  category: {
    type: String,
    enum: ['Reunion', 'Workshop', 'Seminar', 'Networking', 'Cultural', 'Sports', 'NSS', 'Other'],
    default: 'Other'
  },
  bannerImage: { type: String, default: '' },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now }
  }],
  maxAttendees: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  // User-contributed media (photos/videos)
  mediaContributions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    caption: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
