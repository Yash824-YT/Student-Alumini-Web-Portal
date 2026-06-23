const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  graduationYear: { type: Number, default: null },
  department: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  linkedIn: { type: String, default: '' },
  github: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  currentPosition: { type: String, default: '' },
  location: { type: String, default: '' },

  // SGPA data: per semester
  sgpaData: [{
    year: { type: String, default: '' },       // e.g. "2022-23"
    semester: { type: String, default: '' },   // e.g. "Sem 1"
    sgpa: { type: Number, min: 0, max: 10 }
  }],

  // Major Achievements
  achievements: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    year: { type: String, default: '' }
  }],

  // Certifications
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, default: '' },
    year: { type: String, default: '' },
    url: { type: String, default: '' }
  }],

  // Work History (Jobs + Internships)
  workHistory: [{
    company: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ['Job', 'Internship'], default: 'Job' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
