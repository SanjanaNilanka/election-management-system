const express = require('express');
const upload = require('../middleware/upload');
const { registerVoter, getVoters, updateVoter, deleteVoter, getVoterByUserId, approveVoter, getVoterById, registerVoterWithDocs, rejectVoter } = require('../controllers/voterController');
const router = express.Router();

// Register a new voter
router.post('/register', registerVoter);
// Get all voters (Admin/Election Commission only)
router.get('/', getVoters);
// Get a voter by ID (Public or Private based on requirement)
router.get('/:id', getVoterById);
// Get a voter by user ID (Public or Private based on requirement)
router.get('/user/:userId', getVoterByUserId);
// Approve a voter (Admin/Election Commission only)
router.put('/:id/approve', approveVoter);
// Reject a voter (Admin/Election Commission only)
router.put('/:id/reject', rejectVoter);
// Update a voter's details (Admin/Election Commission only)
router.put('/:id', updateVoter);
// Delete a voter (Admin/Election Commission only)
router.delete('/:id', deleteVoter);
router.post(
  '/register-with-docs',
  upload.fields([
    { name: 'nic_front', maxCount: 1 },
    { name: 'nic_back', maxCount: 1 },
    { name: 'birth_cert_front', maxCount: 1 },
    { name: 'birth_cert_back', maxCount: 1 }
  ]),
  registerVoterWithDocs
);

module.exports = router;