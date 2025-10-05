const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); // import multer middleware
const {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  deleteCandidate
} = require('../controllers/candidateController');

// use upload.single('image') for candidate photo
router.post('/', upload.single('image'), createCandidate);
router.get('/', getCandidates);
router.get('/:id', getCandidateById);
router.put('/:id', upload.single('image'), updateCandidate);
router.delete('/:id', deleteCandidate);

module.exports = router;
