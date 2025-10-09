const express = require('express');
const router = express.Router();

const observationsController = require('../controllers/observations');

router.post('/', observationsController.createObservation);
router.get('/', observationsController.getObservations);
router.delete('/:id', observationsController.deleteObservation);

module.exports = router;
