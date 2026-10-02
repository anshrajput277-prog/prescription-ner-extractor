const mongoose = require('mongoose');

const EntitySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    label: {
      type: String,
      enum: ['MEDICINE', 'DOSAGE', 'FREQUENCY', 'DURATION'],
      required: true,
    },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
  },
  { _id: false }
);

const PrescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rawText: {
      type: String,
      required: [true, 'Prescription text is required'],
      trim: true,
      maxlength: [5000, 'Text cannot exceed 5000 characters'],
    },
    // Structured data returned by the ML microservice
    medicine: { type: String, default: null },
    dosage: { type: String, default: null },
    frequency: { type: String, default: null },
    duration: { type: String, default: null },
    entities: [EntitySchema],
    // Optional note added by the user
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// Index for fast queries per user
PrescriptionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);
