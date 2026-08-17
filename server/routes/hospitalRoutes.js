const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospital,
  getFeaturedHospitals,
  getCities,
  createHospital,
  updateHospital,
  deleteHospital,
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getHospitals);
router.get('/featured', getFeaturedHospitals);
router.get('/cities', getCities);
router.get('/:idOrSlug', getHospital);

router.post('/', protect, authorize('admin'), createHospital);
router.put('/:id', protect, authorize('admin'), updateHospital);
router.delete('/:id', protect, authorize('admin'), deleteHospital);

module.exports = router;
