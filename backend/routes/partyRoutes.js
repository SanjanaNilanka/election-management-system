const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createParty,
  getParties,
  updateParty,
  deleteParty
} = require('../controllers/partyController');

// use upload.single('logo') for party logo
router.post('/', upload.single('logo'), createParty);
router.get('/', getParties);
router.put('/:id', upload.single('logo'), updateParty);
router.delete('/:id', deleteParty);

module.exports = router;
