const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true
  },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Notes', 'Previous Year Questions', 'Study Material', 'Syllabus', 'Other'],
    default: 'Notes'
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  department: { type: String, default: 'General' },
  year: { type: String, default: '' },
  semester: { type: String, default: '' },     // e.g. "Sem 3"
  fileUrl: { type: String, default: '' },       // Cloudinary URL or external link
  publicId: { type: String, default: '' },      // Cloudinary public ID for deletion
  fileType: { type: String, default: 'link' },  // 'pdf', 'doc', 'link'
  content: { type: String, default: '' },
  tags: [{ type: String }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
