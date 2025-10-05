const Election = require('../models/Election');

exports.castVote = async (req, res) => {
  const { electionId } = req.params;
  const { voterId, candidateId } = req.body;

  try {
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Check if election is active
    if (election.status !== 'active') {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Prevent duplicate votes
    const alreadyVoted = election.votes.some(v => v.voter.toString() === voterId);
    if (alreadyVoted) {
      return res.status(400).json({ message: 'Voter has already voted in this election' });
    }

    // Record the vote
    election.votes.push({ voter: voterId, candidate: candidateId });

    // Increment candidate vote count
    const candidateEntry = election.candidates.find(
      c => c.candidate.toString() === candidateId
    );
    if (candidateEntry) {
      candidateEntry.votes += 1;
    }

    await election.save();

    res.json({ message: 'Vote cast successfully', election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
