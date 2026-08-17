const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Treatment name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Cosmetic & Plastic Surgery',
        'Dental Treatments',
        'Fertility & IVF Care',
        'Hair Restoration',
        'Cardiology & Heart Surgery',
        'Orthopedics & Joint Replacement',
        'Oncology & Cancer Care',
        'Neuro & Spine Surgery',
        'Ayurveda & Wellness',
      ],
    },
    shortSummary: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    avgStayDays: {
      type: Number,
      required: true,
      default: 3,
    },
    avgRecoveryDays: {
      type: Number,
      required: true,
      default: 7,
    },
    successRate: {
      type: String,
      default: '98%',
    },
    costIndiaUSD: {
      type: Number,
      required: true,
    },
    costUSAUSD: {
      type: Number,
      required: true,
    },
    costUKUSD: {
      type: Number,
      required: true,
    },
    costThailandUSD: {
      type: Number,
      default: 0,
    },
    costUAEUSD: {
      type: Number,
      default: 0,
    },
    costSingaporeUSD: {
      type: Number,
      default: 0,
    },
    procedureSteps: [String],
    inclusions: [String],
    idealCandidates: String,
    heroImage: {
      type: String,
      required: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Treatment', treatmentSchema);
