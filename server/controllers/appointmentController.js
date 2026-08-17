const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const DoctorSlot = require('../models/DoctorSlot');
const Treatment = require('../models/Treatment');

// Helper to generate unique reference code: MJ-2026-XXXX
const generateReferenceCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MJ-2026-${randomStr}`;
};

// @desc    Submit a new appointment / consultation request
// @route   POST /api/appointments
// @access  Public / Patient
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      patientName,
      patientEmail,
      patientPhone,
      patientCountry,
      passportNumber,
      doctorId,
      hospitalId,
      treatmentId,
      appointmentDate,
      timeSlot,
      consultationType,
      symptomsDescription,
      preferredLanguage,
      visaAssistanceRequired,
      airportPickupRequired,
      slotId,
    } = req.body;

    if (!patientName || !patientEmail || !patientPhone || !doctorId || !hospitalId || !appointmentDate || !timeSlot || !symptomsDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: name, email, phone, doctor, hospital, date, time slot, and medical description',
      });
    }

    // Verify doctor and hospital exist
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Selected doctor not found' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Selected hospital not found' });
    }

    let appointmentRef = generateReferenceCode();
    // Ensure uniqueness
    let duplicate = await Appointment.findOne({ appointmentRef });
    while (duplicate) {
      appointmentRef = generateReferenceCode();
      duplicate = await Appointment.findOne({ appointmentRef });
    }

    // Handle files if uploaded
    let medicalReports = [];
    if (req.files && req.files.length > 0) {
      medicalReports = req.files.map((file) => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
      }));
    }

    const appointment = await Appointment.create({
      appointmentRef,
      patientId: req.user ? req.user._id : null,
      patientName,
      patientEmail: patientEmail.toLowerCase(),
      patientPhone,
      patientCountry: patientCountry || 'United States',
      passportNumber: passportNumber || '',
      doctorId,
      hospitalId,
      treatmentId: treatmentId || null,
      appointmentDate,
      timeSlot,
      consultationType: consultationType || 'teleconsultation',
      status: 'pending',
      symptomsDescription,
      medicalReports,
      preferredLanguage: preferredLanguage || 'English',
      visaAssistanceRequired: Boolean(visaAssistanceRequired),
      airportPickupRequired: Boolean(airportPickupRequired),
    });

    // If a specific slot ID was passed, mark it booked
    if (slotId) {
      await DoctorSlot.findByIdAndUpdate(slotId, {
        isBooked: true,
        bookedAppointmentId: appointment._id,
      });
    }

    // Return populated appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctorId', 'fullName specialty qualifications avatarUrl consultationFeeUSD')
      .populate('hospitalId', 'name city state airportName address')
      .populate('treatmentId', 'name category');

    res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments for current logged-in patient or by email query
// @route   GET /api/appointments/my-requests
// @access  Public / Private
exports.getPatientAppointments = async (req, res, next) => {
  try {
    let query = {};

    if (req.user) {
      query.$or = [{ patientId: req.user._id }, { patientEmail: req.user.email.toLowerCase() }];
    } else if (req.query.email) {
      query.patientEmail = req.query.email.toLowerCase();
    } else {
      return res.status(400).json({ success: false, message: 'Please provide patient email or log in' });
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'fullName specialty qualifications avatarUrl consultationFeeUSD')
      .populate('hospitalId', 'name city state airportName address heroImage')
      .populate('treatmentId', 'name category costIndiaUSD')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Doctor's appointments queue
// @route   GET /api/appointments/doctor-queue
// @access  Private (Doctor)
exports.getDoctorQueue = async (req, res, next) => {
  try {
    let doctor;
    if (req.query.doctorId) {
      doctor = await Doctor.findById(req.query.doctorId);
    }
    if (!doctor && req.user) {
      doctor = await Doctor.findOne({ userId: req.user._id });
    }
    if (!doctor) {
      doctor = await Doctor.findOne();
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const { status, date } = req.query;
    let query = { doctorId: doctor._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      query.appointmentDate = date;
    }

    const appointments = await Appointment.find(query)
      .populate('treatmentId', 'name category')
      .populate('hospitalId', 'name city')
      .sort({ appointmentDate: 1, createdAt: -1 });

    res.json({
      success: true,
      doctor: {
        _id: doctor._id,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
      },
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Admin Master Ledger)
// @route   GET /api/appointments/admin-all
// @access  Private/Admin
exports.getAdminAppointments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { appointmentRef: searchRegex },
        { patientName: searchRegex },
        { patientEmail: searchRegex },
        { patientCountry: searchRegex },
      ];
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'fullName specialty')
      .populate('hospitalId', 'name city')
      .populate('treatmentId', 'name category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details by Ref or ID
// @route   GET /api/appointments/:idOrRef
// @access  Public / Private
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { idOrRef } = req.params;
    let appointment;

    if (idOrRef.match(/^[0-9a-fA-F]{24}$/)) {
      appointment = await Appointment.findById(idOrRef)
        .populate('doctorId')
        .populate('hospitalId')
        .populate('treatmentId');
    } else {
      appointment = await Appointment.findOne({ appointmentRef: idOrRef.toUpperCase() })
        .populate('doctorId')
        .populate('hospitalId')
        .populate('treatmentId');
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment reference not found' });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Confirm, Reschedule, Complete, Cancel)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor / Admin / Patient for cancel)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes, treatmentPlanSummary, proposedDate, proposedTimeSlot } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (status) appointment.status = status;
    if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;
    if (treatmentPlanSummary !== undefined) appointment.treatmentPlanSummary = treatmentPlanSummary;
    if (proposedDate) appointment.proposedDate = proposedDate;
    if (proposedTimeSlot) appointment.proposedTimeSlot = proposedTimeSlot;

    const updated = await appointment.save();

    const populated = await Appointment.findById(updated._id)
      .populate('doctorId', 'fullName specialty qualifications avatarUrl')
      .populate('hospitalId', 'name city')
      .populate('treatmentId', 'name');

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload additional medical documents to an appointment
// @route   POST /api/appointments/:id/upload-document
// @access  Public / Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const newReport = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    appointment.medicalReports.push(newReport);
    await appointment.save();

    res.json({
      success: true,
      message: 'Medical report uploaded successfully',
      medicalReports: appointment.medicalReports,
    });
  } catch (error) {
    next(error);
  }
};
