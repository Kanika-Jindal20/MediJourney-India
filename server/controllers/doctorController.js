const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const DoctorSlot = require('../models/DoctorSlot');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// @desc    Get all doctors with filtering & search
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res, next) => {
  try {
    const { specialty, hospitalId, city, language, search, minExp } = req.query;
    let query = { isAvailable: true };

    if (specialty && specialty !== 'All') {
      query.specialty = new RegExp(specialty, 'i');
    }

    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    if (language && language !== 'All') {
      query.languagesSpoken = { $in: [new RegExp(language, 'i')] };
    }

    if (minExp) {
      query.experienceYears = { $gte: Number(minExp) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { specialty: searchRegex },
        { qualifications: searchRegex },
        { bio: searchRegex },
      ];
    }

    let doctors = await Doctor.find(query)
      .populate('hospitalId', 'name city state accreditations rating heroImage address')
      .sort({ rating: -1, experienceYears: -1 });

    // If filtered by city, filter by populated hospital city
    if (city && city !== 'All') {
      doctors = doctors.filter(
        (doc) => doc.hospitalId && doc.hospitalId.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('hospitalId');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get upcoming open slots for the next 14 days
    const todayStr = new Date().toISOString().split('T')[0];
    const slots = await DoctorSlot.find({
      doctorId: doctor._id,
      slotDate: { $gte: todayStr },
      isBooked: false,
    }).sort({ slotDate: 1, startTime: 1 });

    // Get doctor reviews
    const reviews = await Review.find({ doctorId: doctor._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      doctor,
      slots,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor slots by date
// @route   GET /api/doctors/:id/slots
// @access  Public
exports.getDoctorSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    let query = { doctorId: req.params.id };

    if (date) {
      query.slotDate = date;
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      query.slotDate = { $gte: todayStr };
    }

    const slots = await DoctorSlot.find(query).sort({ slotDate: 1, startTime: 1 });

    res.json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new slot for doctor (Doctor or Admin)
// @route   POST /api/doctors/:id/slots
// @access  Private (Doctor/Admin)
exports.createSlot = async (req, res, next) => {
  try {
    const { slotDate, startTime, endTime, slotType } = req.body;
    const doctorId = req.params.id;

    if (!slotDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide slotDate, startTime, and endTime' });
    }

    const existingSlot = await DoctorSlot.findOne({
      doctorId,
      slotDate,
      startTime,
    });

    if (existingSlot) {
      return res.status(400).json({ success: false, message: 'A slot already exists at this date and time' });
    }

    const slot = await DoctorSlot.create({
      doctorId,
      slotDate,
      startTime,
      endTime,
      slotType: slotType || 'teleconsultation',
      isBooked: false,
    });

    res.status(201).json({
      success: true,
      slot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a slot (Doctor or Admin)
// @route   DELETE /api/doctors/slots/:slotId
// @access  Private (Doctor/Admin)
exports.deleteSlot = async (req, res, next) => {
  try {
    const slot = await DoctorSlot.findById(req.params.slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: 'Cannot delete a slot that is already booked' });
    }

    await DoctorSlot.findByIdAndDelete(req.params.slotId);

    res.json({
      success: true,
      message: 'Slot removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor (Admin only)
// @route   POST /api/doctors
// @access  Private/Admin
exports.createDoctor = async (req, res, next) => {
  try {
    const { fullName, hospitalId, specialty, qualifications, experienceYears, consultationFeeUSD, bio, languagesSpoken, avatarUrl } = req.body;

    if (!fullName || !hospitalId || !specialty || !qualifications || !bio) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const doctor = await Doctor.create({
      fullName,
      hospitalId,
      specialty,
      qualifications,
      experienceYears: experienceYears || 10,
      consultationFeeUSD: consultationFeeUSD || 40,
      bio,
      languagesSpoken: Array.isArray(languagesSpoken) ? languagesSpoken : ['English'],
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    });

    res.status(201).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor (Doctor or Admin)
// @route   PUT /api/doctors/:id
// @access  Private
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor dashboard metrics
// @route   GET /api/doctors/dashboard/metrics
// @access  Private (Doctor)
exports.getDoctorMetrics = async (req, res, next) => {
  try {
    // Find doctor linked to current user, or get first matching doctor for demo
    let doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      doctor = await Doctor.findOne();
    }

    if (!doctor) {
      return res.json({
        success: true,
        metrics: {
          pendingRequests: 0,
          confirmedUpcoming: 0,
          totalCompleted: 0,
          internationalPatients: 0,
        },
      });
    }

    const pendingCount = await Appointment.countDocuments({ doctorId: doctor._id, status: 'pending' });
    const confirmedCount = await Appointment.countDocuments({ doctorId: doctor._id, status: 'confirmed' });
    const completedCount = await Appointment.countDocuments({ doctorId: doctor._id, status: 'completed' });
    const totalPatients = await Appointment.distinct('patientEmail', { doctorId: doctor._id });

    res.json({
      success: true,
      doctor,
      metrics: {
        pendingRequests: pendingCount,
        confirmedUpcoming: confirmedCount,
        totalCompleted: completedCount,
        internationalPatients: totalPatients.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
