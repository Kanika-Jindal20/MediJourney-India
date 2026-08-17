const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentRef: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientEmail: {
      type: String,
      required: [true, 'Patient email is required'],
      lowercase: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone/WhatsApp is required'],
    },
    patientCountry: {
      type: String,
      required: [true, 'Country of residence is required'],
      default: 'United States',
    },
    passportNumber: {
      type: String,
      default: '',
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor selection is required'],
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital selection is required'],
    },
    treatmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
      default: null,
    },
    appointmentDate: {
      type: String,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    consultationType: {
      type: String,
      enum: ['teleconsultation', 'in_person'],
      default: 'teleconsultation',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    symptomsDescription: {
      type: String,
      required: [true, 'Please describe your medical condition/inquiry'],
    },
    medicalReports: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    visaAssistanceRequired: {
      type: Boolean,
      default: false,
    },
    airportPickupRequired: {
      type: Boolean,
      default: false,
    },
    proposedDate: {
      type: String,
      default: '',
    },
    proposedTimeSlot: {
      type: String,
      default: '',
    },
    doctorNotes: {
      type: String,
      default: '',
    },
    treatmentPlanSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
appointmentSchema.index({ patientEmail: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 });
appointmentSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
