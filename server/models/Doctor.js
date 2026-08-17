const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital affiliation is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    title: {
      type: String,
      default: 'Senior Consultant & Head of Department',
    },
    specialty: {
      type: String,
      required: true,
      trim: true, // e.g. Cosmetic & Plastic Surgery, Dental Implantology, Reproductive Medicine / IVF, Hair Restoration, Interventional Cardiology, Joint Replacement & Orthopedics, Surgical Oncology
    },
    subSpecialties: [String],
    qualifications: {
      type: String,
      required: true, // e.g. "MBBS, MS, MCh (Plastic Surgery), Fellowship (USA)"
    },
    experienceYears: {
      type: Number,
      required: true,
      default: 15,
    },
    languagesSpoken: [
      {
        type: String, // English, Hindi, Arabic, Russian, French, Spanish
      },
    ],
    consultationFeeUSD: {
      type: Number,
      required: true,
      default: 40,
    },
    bio: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    },
    surgeriesCount: {
      type: Number,
      default: 3500,
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availableDays: [
      {
        type: String, // 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
