const express = require('express');
const router = express.Router();
const { aiDiscovery } = require('../controllers/aiController');

router.post('/discovery', aiDiscovery);

module.exports = router;
