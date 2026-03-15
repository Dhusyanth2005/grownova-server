import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  mobileNo: {
    type: String,
    required: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, 'Pincode must be 6 digits']
  },
  jobTitle: {
    type: String,
    enum: ['part time', 'full time'],
    required: true
  },
  currentProfession: {
    type: String,
    enum: ['student', 'job', 'business', 'housewife'],
    required: true
  },
  isWebinarCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Customer', customerSchema);