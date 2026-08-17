const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getDoctorSlots,
  createSlot,
  deleteSlot,
  createDoctor,
  updateDoctor,
  getDoctorMetrics,
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getDoctors);
router.get('/dashboard/metrics', protect, authorize('doctor', 'admin'), getDoctorMetrics);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);

router.post('/:id/slots', protect, authorize('doctor', 'admin'), createSlot);
router.delete('/slots/:slotId', protect, authorize('doctor', 'admin'), deleteSlot);

router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctor);

module.exports = router;
