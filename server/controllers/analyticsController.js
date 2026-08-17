const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Treatment = require('../models/Treatment');
const User = require('../models/User');

// @desc    Get Admin summary analytics
// @route   GET /api/analytics/summary
// @access  Private/Admin
exports.getAnalyticsSummary = async (req, res, next) => {
  try {
    const totalHospitals = await Hospital.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalTreatments = await Treatment.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments();
    
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    // Aggregation of patient countries
    const countryBreakdown = await Appointment.aggregate([
      {
        $group: {
          _id: '$patientCountry',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Aggregation of requested treatments/specialties
    const treatmentBreakdown = await Appointment.aggregate([
      {
        $lookup: {
          from: 'treatments',
          localField: 'treatmentId',
          foreignField: '_id',
          as: 'treatment',
        },
      },
      {
        $unwind: {
          path: '$treatment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: { $ifNull: ['$treatment.category', 'General Specialist Consultation'] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalHospitals,
        totalDoctors,
        totalTreatments,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        estimatedTotalSavingsUSD: totalAppointments * 12500, // Estimated savings calculation
      },
      countryBreakdown: countryBreakdown.map((c) => ({ country: c._id || 'Unknown', count: c.count })),
      treatmentBreakdown: treatmentBreakdown.map((t) => ({ category: t._id, count: t.count })),
    });
  } catch (error) {
    next(error);
  }
};
