const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['candidate', 'recruiter', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'candidate',
    },
    // Role-specific optional fields — kept minimal for the foundation phase.
    // These will be extended once resume/job features are built.
    company: {
      type: String, // used by recruiters
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true, // lets admins disable an account without deleting it
    },
    profilePicture: {
      data: { type: Buffer, select: false },
      contentType: { type: String, select: false },
    },
    profilePictureUpdatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash the password before saving, only if it was modified.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare a plaintext password against the stored hash.
userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never leak the password hash even if the document is serialized directly.
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
