const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller');

// Note: Later, you can add middleware here like 'protect' (admin only)
// Example: router.post('/', protect, admin, facilityController.create);

router.post('/', facilityController.create);
router.get('/', facilityController.getAll);
router.get('/:id', facilityController.getOne);
router.put('/:id', facilityController.update);
router.delete('/:id', facilityController.remove);

module.exports = router;