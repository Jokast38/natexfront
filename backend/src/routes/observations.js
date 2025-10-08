const express = require('express');
const router = express.Router();

const observationsController = require('../controllers/observations');

router.post('/', observationsController.createObservation);

module.exports = router;
