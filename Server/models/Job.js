const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  location: { type: String, required: true, default: 'Remote' },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
    default: 'Full-time'
  },
  salary: { type: String, default: 'Not disclosed' },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: { type: String, default: '' },
  skills: [{ type: String }],
  applicationDeadline: { type: Date, default: null },
  applicationLink: { type: String, default: '' },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Full application submissions
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    resumeLink: { type: String, default: '' },
    coverNote: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
