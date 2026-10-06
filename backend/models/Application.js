const mongoose = require('mongoose');

const matchSnapshotSchema = new mongoose.Schema(
  {
    skillScore: { type: Number, default: 0 },
    similarityScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    educationScore: { type: Number, default: 0 },
    finalScore: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    coverLetter: { type: String, trim: true, maxlength: 5000 },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    match: { type: matchSnapshotSchema, required: true },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);