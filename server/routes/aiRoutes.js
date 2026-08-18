const express = require('express');
const router = express.Router();
const { aiDiscovery, generateItinerary, aiChat } = require('../controllers/aiController');

router.post('/discovery', aiDiscovery);
router.post('/itinerary', generateItinerary);
router.post('/chat', aiChat);

module.exports = router;

