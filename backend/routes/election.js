const express = require('express');
const { getElections, createElection } = require('../controllers/electionController');

const router = express.Router();

router.get('/', getElections);
router.post('/', createElection); 

module.exports = router;