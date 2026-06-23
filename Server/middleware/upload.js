const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Profile photo storage
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'alumni/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// Event media storage (images + videos)
const eventStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'alumni/events',
    resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'avi'],
  }),
});

// Notes PDF storage
const noteStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'alumni/notes',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
  },
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadEventMedia = multer({
  storage: eventStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video
});

const uploadNote = multer({
  storage: noteStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = { uploadProfile, uploadEventMedia, uploadNote, cloudinary };
