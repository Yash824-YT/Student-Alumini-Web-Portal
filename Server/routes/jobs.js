const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');

// @route   GET /api/jobs
// @desc    Get all job listings
router.get('/', async (req, res) => {
  try {
    const { search, type, page = 1, limit = 10 } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (type) query.type = type;

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('postedBy', 'name email profilePic')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ jobs, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), total });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email profilePic');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create a job listing — any logged-in user
router.post('/', auth, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id,
      skills: req.body.skills
        ? (Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s => s.trim()))
        : []
    };

    const job = new Job(jobData);
    await job.save();
    await job.populate('postedBy', 'name email profilePic');
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id/apply
// @desc    Apply for a job with full form
router.put('/:id/apply', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = job.applicants.some(
      app => app.user && app.user.toString() === req.user._id.toString()
    );
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied for this job' });

    job.applicants.push({
      user: req.user._id,
      name: req.body.name || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      resumeLink: req.body.resumeLink || '',
      coverNote: req.body.coverNote || '',
    });
    await job.save();

    res.json({ message: 'Applied successfully!', applicants: job.applicants.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id/applications
// @desc    View applicants (job poster or admin only)
router.get('/:id/applications', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('applicants.user', 'name email profilePic');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isPoster = job.postedBy.toString() === req.user._id.toString();
    if (!isPoster && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ applicants: job.applicants, total: job.applicants.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete a job listing (poster or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isPoster = job.postedBy.toString() === req.user._id.toString();
    if (!isPoster && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
