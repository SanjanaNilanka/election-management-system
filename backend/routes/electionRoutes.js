const express = require('express');
const router = express.Router();
const {
  createElection,
  getElections,
  getElectionById,
  updateElection,
  deleteElection,
  activateElection,
  closeElection
} = require('../controllers/electionController');

// Routes
router.post('/', createElection);          // Create new election
router.get('/', getElections);             // Get all elections
router.get('/:id', getElectionById);       // Get single election
router.put('/:id', updateElection);        // Update election details
router.delete('/:id', deleteElection);     // Delete election
router.patch('/:id/activate', activateElection); // Activate election
router.patch('/:id/close', closeElection); // Close election

module.exports = router;
