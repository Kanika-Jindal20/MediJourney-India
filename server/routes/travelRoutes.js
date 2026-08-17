const express = require('express');
const router = express.Router();
const { getTravelGuidelines } = require('../controllers/travelController');

router.get('/guidelines', getTravelGuidelines);

module.exports = router;
