const express = require('express');
const router = express.Router();
const {
  getAll,
  getOne,
  create,
  update,
  remove,
  getStats,
} = require('../controllers/appointmentController');

router.get('/stats', getStats);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
