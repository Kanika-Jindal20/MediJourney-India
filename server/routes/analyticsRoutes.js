const express = require('express');
const router = express.Router();
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/summary', protect, authorize('admin'), getAnalyticsSummary);

module.exports = router;
