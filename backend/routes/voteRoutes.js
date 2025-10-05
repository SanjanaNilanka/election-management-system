const express = require('express');
const router = express.Router();
const { castVote } = require('../controllers/voteController');

router.post('/:electionId/vote', castVote);

module.exports = router;
