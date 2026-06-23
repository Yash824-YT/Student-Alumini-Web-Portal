const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

// @route   GET /api/users
// @desc    Get all alumni profiles with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, department, graduationYear, page = 1, limit = 12 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
        { currentPosition: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) query.department = { $regex: department, $options: 'i' };
    if (graduationYear) query.graduationYear = parseInt(graduationYear);

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ users, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile (JSON fields)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/photo
// @desc    Upload profile photo (Cloudinary)
router.post('/:id/photo', auth, uploadProfile.single('photo'), async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic: req.file.path },
      { new: true }
    ).select('-password');

    res.json({ message: 'Photo uploaded successfully', profilePic: req.file.path, user });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
