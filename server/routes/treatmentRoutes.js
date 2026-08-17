const express = require('express');
const router = express.Router();
const {
  getTreatments,
  getTreatment,
  compareTreatments,
  createTreatment,
  updateTreatment,
  deleteTreatment,
} = require('../controllers/treatmentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getTreatments);
router.get('/compare/items', compareTreatments);
router.get('/:slugOrId', getTreatment);

router.post('/', protect, authorize('admin'), createTreatment);
router.put('/:id', protect, authorize('admin'), updateTreatment);
router.delete('/:id', protect, authorize('admin'), deleteTreatment);

module.exports = router;
