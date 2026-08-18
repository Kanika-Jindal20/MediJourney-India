const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getPatientAppointments,
  getDoctorQueue,
  getAdminAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  uploadDocument,
  getVisaInvitationLetter,
  updateFlightLogistics,
} = require('../controllers/appointmentController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or logged-in patient creates appointment (supports multipart with files)
router.post('/', optionalAuth, upload.array('medicalReports', 5), createAppointment);

// Patient gets their appointments
router.get('/my-requests', optionalAuth, getPatientAppointments);

// Doctor queue
router.get('/doctor-queue', protect, authorize('doctor', 'admin'), getDoctorQueue);

// Admin master ledger
router.get('/admin-all', protect, authorize('admin'), getAdminAppointments);

// Hospital Visa Invitation Letter
router.get('/:idOrRef/visa-letter', getVisaInvitationLetter);

// Single appointment lookup
router.get('/:idOrRef', getAppointmentById);

// Update status (Doctor / Admin)
router.patch('/:id/status', protect, updateAppointmentStatus);

// Upload extra document
router.post('/:id/upload-document', upload.single('medicalReport'), uploadDocument);

// Update flight logistics
router.patch('/:id/flight-logistics', updateFlightLogistics);

module.exports = router;
