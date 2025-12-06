const express = require('express');
const router = express.Router();
const {
    createGN,
    getAllGNs,
    updateGN,
    deleteGN,
    getGNById,
    getGNByUserId,
    getGNByDivisionName
} = require('../controllers/gnController');

// Routes
router.post('/', createGN);          // Create new GN
router.get('/', getAllGNs);             // Get all GNs
router.get('/:id', getGNById);       // Get single GN by GN ID
router.get('/user/:userId', getGNByUserId); // Get GN by User ID
router.put('/:id', updateGN);        // Update GN details
router.delete('/:id', deleteGN);     // Delete GN   
router.get('/division/:divisionName', getGNByDivisionName);

module.exports = router;