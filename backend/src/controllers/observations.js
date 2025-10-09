const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { get } = require('http');
const prisma = new PrismaClient();

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_PATH || 'uploads');
// ensure upload directory exists
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn('Could not create upload dir', uploadDir, e.message);
}
// Basic limits: protect server from huge uploads (10MB default from .env MAX_FILE_SIZE)
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);
const upload = multer({ dest: uploadDir, limits: { fileSize: maxFileSize } });

// Wrapper to use multer for a single file and return a promise
function multerSingle(req, res) {
  return new Promise((resolve, reject) => {
    const handler = upload.single('photo');
    handler(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

exports.createObservation = async (req, res) => {
  try {
    // parse multipart if present
    await multerSingle(req, res).catch(() => {});

    let imageUrl = req.body.imageUrl || null;

    if (req.file) {
      // ensure Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        // delete temp file
        try { fs.unlinkSync(req.file.path); } catch (e) {}
        return res.status(500).json({ success: false, message: 'Cloudinary not configured on server. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.' });
      }
      // upload local file to Cloudinary
      const localPath = req.file.path;
      const uploadResult = await cloudinary.uploader.upload(localPath, { folder: 'nature_explorer' });
      imageUrl = uploadResult.secure_url;

      // remove temp file
      fs.unlink(localPath, (err) => {
        if (err) console.warn('Failed to delete temp upload', localPath, err.message);
      });
    }

    // At this point we have imageUrl (from client or uploaded)
    // Parse other metadata
    const { lat, lng, locationName, legend } = req.body || {};

    // Persist to DB (Prisma)
    const created = await prisma.observation.create({
      data: {
        imageUrl: imageUrl || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        locationName: locationName || null,
        legend: legend || null,
      },
    });

    return res.status(201).json({ success: true, id: created.id, observation: created });
  } catch (err) {
    console.error('observations.createObservation error', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
};

exports.getObservations = async (req, res) => {
  try {
    const observations = await prisma.observation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, observations });
  } catch (err) {
    console.error('observations.getObservations error', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to retrieve observations' });
  }
};
exports.deleteObservation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Missing observation ID' });

    // Prisma model uses Int for id — parse and validate
    const idInt = parseInt(id, 10);
    if (Number.isNaN(idInt)) return res.status(400).json({ success: false, message: 'Invalid observation ID (expected integer)' });

    // Check if observation exists
    const existing = await prisma.observation.findUnique({ where: { id: idInt } });
    if (!existing) return res.status(404).json({ success: false, message: 'Observation not found' });

    // Delete from DB
    await prisma.observation.delete({ where: { id: idInt } });
    return res.status(204).send();
  } catch (err) {
    console.error('observations.deleteObservation error', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete observation' });
  }
};