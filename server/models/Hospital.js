const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    airportDistanceKm: {
      type: Number,
      default: 15,
    },
    airportName: {
      type: String,
      default: 'Indira Gandhi International Airport (DEL)',
    },
    accreditations: [
      {
        type: String, // e.g. JCI, NABH, NABL, ISO 9001
      },
    ],
    specialties: [
      {
        type: String, // Cosmetic, Dental, Fertility & IVF, Hair Restoration, Cardiology, Orthopedics, Oncology, Neuro
      },
    ],
    description: {
      type: String,
      required: true,
    },
    heroImage: {
      type: String,
      required: true,
    },
    galleryImages: [String],
    internationalServices: [
      {
        type: String, // e.g. "Airport Pickup & Drop", "Dedicated International Patient Lounge", "Multi-lingual Translators (Arabic, Russian, French)", "Medical Visa Assistance", "Halal / Specialized Diet", "Currency Exchange Desk"
      },
    ],
    facilities: [String],
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    bedsCount: {
      type: Number,
      default: 500,
    },
    establishedYear: {
      type: Number,
      default: 1995,
    },
    contactEmail: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    websiteUrl: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hospital', hospitalSchema);
