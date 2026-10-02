const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes below require a valid JWT
router.use(protect);

// --- POST /api/prescriptions -------------------------------------------------
// Extract NER from text AND save to DB
router.post(
  '/',
  [
    body('text').trim().notEmpty().withMessage('Prescription text is required')
      .isLength({ max: 5000 }).withMessage('Text cannot exceed 5000 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { text, notes } = req.body;

    // -- Call the Python ML microservice --------------------------------------
    let nerResult;
    try {
      const mlResponse = await axios.post(
        process.env.ML_SERVICE_URL + '/extract',
        { text },
        { timeout: 10000 }
      );

      nerResult = mlResponse.data;
    } catch (err) {
      console.error('ML service error:', err.message);
      return res.status(502).json({
        success: false,
        message: 'NER service is unavailable. Make sure the Python microservice is running.',
      });
    }

    // -- Save to MongoDB ------------------------------------------------------
    try {
      const prescription = await Prescription.create({
        user: req.user._id,
        rawText: text,
        medicine: nerResult.medicine,
        dosage: nerResult.dosage,
        frequency: nerResult.frequency,
        duration: nerResult.duration,
        entities: nerResult.entities,
        notes: notes || '',
      });

      res.status(201).json({
        success: true,
        message: 'Prescription extracted and saved',
        prescription,
      });
    } catch (err) {
      console.error('DB save error:', err);
      res.status(500).json({ success: false, message: 'Failed to save prescription' });
    }
  }
);

// --- GET /api/prescriptions ---------------------------------------------------
// Get all prescriptions for the logged-in user (newest first)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [prescriptions, total] = await Promise.all([
      Prescription.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Prescription.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      prescriptions,
    });
  } catch (err) {
    console.error('Fetch prescriptions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch prescriptions' });
  }
});

// --- GET /api/prescriptions/:id -----------------------------------------------
// Get a single prescription (only if it belongs to the logged-in user)
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.json({ success: true, prescription });
  } catch (err) {
    console.error('Fetch single prescription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- DELETE /api/prescriptions/:id -------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    res.json({ success: true, message: 'Prescription deleted successfully' });
  } catch (err) {
    console.error('Delete prescription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
