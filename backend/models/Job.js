const mongoose = require('mongoose');

const skillRequirementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    weight: { type: Number, min: 0, default: 1 },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    company: { type: String, trim: true, maxlength: 150 },
    location: { type: String, trim: true, maxlength: 150 },
    salary: { type: String, trim: true, maxlength: 150, default: 'Negotiable' },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
      default: 'full-time',
    },
    description: { type: String, required: true, trim: true },
    requiredSkills: { type: [skillRequirementSchema], default: [] },
    preferredSkills: { type: [skillRequirementSchema], default: [] },
    requiredExperience: { type: Number, min: 0, default: 0 },
    educationRequirement: { type: String, trim: true, maxlength: 300 },
    status: { type: String, enum: ['open', 'closed', 'expired'], default: 'open', index: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);