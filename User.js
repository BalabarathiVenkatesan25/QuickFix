const mongoose = require('mongoose');
const { ALLOWED_SKILLS } = require('../constants/skills');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['client', 'professional', 'admin'],
      default: 'client',
      required: true,
    },
    skills: {
      type: [String],
      validate: [
        {
          validator(value) {
            if (this.role !== 'professional') return value.length === 0;
            if (!Array.isArray(value) || value.length === 0) return false;
            return value.every((s) => ALLOWED_SKILLS.includes(s));
          },
          message:
            'Invalid skills. Professionals must select at least one valid skill.',
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);


