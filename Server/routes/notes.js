const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { auth } = require('../middleware/auth');
const { uploadNote } = require('../middleware/upload');

// @route   GET /api/notes
// @desc    Get all notes with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, department, semester, page = 1, limit = 12 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category) query.category = category;
    if (department && department !== 'General') query.department = department;
    if (semester) query.semester = semester;

    const total = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('uploadedBy', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ notes, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/branches
// @desc    Get departments with note counts
router.get('/branches', async (req, res) => {
  try {
    const branches = await Note.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/notes/:id
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('uploadedBy', 'name profilePic');
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notes
// @desc    Upload a note — any logged-in user (with optional PDF upload)
router.post('/', auth, uploadNote.single('file'), async (req, res) => {
  try {
    const noteData = {
      ...req.body,
      uploadedBy: req.user._id,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
    };

    if (req.file) {
      noteData.fileUrl = req.file.path;
      noteData.publicId = req.file.filename;
      noteData.fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
    } else if (req.body.fileUrl) {
      noteData.fileType = 'link';
    }

    const note = new Note(noteData);
    await note.save();
    await note.populate('uploadedBy', 'name profilePic');
    res.status(201).json(note);
  } catch (error) {
    console.error('Upload note error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   PUT /api/notes/:id/download
// @desc    Track download count
router.put('/:id/download', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    res.json({ downloads: note.downloads });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note (uploader or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const isOwner = note.uploadedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
