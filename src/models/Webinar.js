// src/models/Webinar.js
import mongoose from 'mongoose';

const webinarSchema = new mongoose.Schema({
  webinarLink: {
    type: String,
    required: true,
    trim: true,
    // No regex validation — any string is accepted
  },
  whatsappNo: {
    type: String,
    required: true,
    trim: true,
    // No regex validation — any string is accepted
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // updatedAt is already handled by timestamps: true → no need to keep it manually
}, {
  timestamps: true   // automatically adds createdAt & updatedAt
});

// Keep only one active webinar at a time (optional but useful)
webinarSchema.pre('save', async function (next) {
  // Only run when creating new doc or changing isActive to true
  if (this.isNew || this.isModified('isActive')) {
    if (this.isActive) {
      // Deactivate all other webinars
      await mongoose.model('Webinar').updateMany(
        { _id: { $ne: this._id }, isActive: true },
        { $set: { isActive: false } }
      );
    }
  }
});

export default mongoose.model('Webinar', webinarSchema);