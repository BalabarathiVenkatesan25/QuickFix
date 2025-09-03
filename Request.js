const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true,
      enum: ['plumbing', 'electrical', 'carpentry', 'painting', 'cleaning']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Will be set when professional accepts
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium'
    },
    budget: {
      min: { type: Number, required: false },
      max: { type: Number, required: false }
    },
    scheduledDate: { type: Date, required: false },
    completedDate: { type: Date, required: false }
  },
  { timestamps: true }
);

// Index for efficient queries
RequestSchema.index({ category: 1, status: 1 });
RequestSchema.index({ homeowner: 1, status: 1 });
RequestSchema.index({ professional: 1, status: 1 });

module.exports = mongoose.model('Request', RequestSchema);
