const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
