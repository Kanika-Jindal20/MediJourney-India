const mongoose = require('mongoose');

const doctorSlotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    slotDate: {
      type: String, // 'YYYY-MM-DD' format for easy timezone-independent lookup
      required: true,
    },
    startTime: {
      type: String, // e.g. "10:00 AM" or "14:30"
      required: true,
    },
    endTime: {
      type: String, // e.g. "10:30 AM" or "15:00"
      required: true,
    },
    slotType: {
      type: String,
      enum: ['teleconsultation', 'in_person', 'both'],
      default: 'teleconsultation',
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick slot availability queries
doctorSlotSchema.index({ doctorId: 1, slotDate: 1, isBooked: 1 });

module.exports = mongoose.model('DoctorSlot', doctorSlotSchema);
