// controllers/electionController.js
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');

exports.createElection = async (req, res) => {
  try {
    const election = await Election.create(req.body);
    // Update candidates' elections array
    for (const cand of election.candidates) {
      await Candidate.findByIdAndUpdate(cand.candidate, { $push: { elections: election._id } });
    }
    res.status(201).json(election);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find()
      .populate('candidates.candidate')
      .populate('candidates.party')
      .populate('createdBy', 'name email');
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('candidates.candidate')
      .populate('candidates.party');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateElection = async (req, res) => {
  try {
    const oldElection = await Election.findById(req.params.id);
    if (!oldElection) return res.status(404).json({ message: 'Election not found' });

    const oldCandidateIds = oldElection.candidates.map(c => c.candidate.toString());
    const newCandidates = req.body.candidates || oldElection.candidates;
    const newCandidateIds = newCandidates.map(c => c.candidate.toString());

    // Removed candidates
    const removed = oldCandidateIds.filter(id => !newCandidateIds.includes(id));
    for (const id of removed) {
      await Candidate.findByIdAndUpdate(id, { $pull: { elections: oldElection._id } });
    }

    // Added candidates
    const added = newCandidateIds.filter(id => !oldCandidateIds.includes(id));
    for (const id of added) {
      await Candidate.findByIdAndUpdate(id, { $push: { elections: oldElection._id } });
    }

    const updated = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Remove election from candidates' arrays
    for (const cand of election.candidates) {
      await Candidate.findByIdAndUpdate(cand.candidate, { $pull: { elections: election._id } });
    }

    await Election.findByIdAndDelete(req.params.id);
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.activateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json(election);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.closeElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true });
    res.json(election);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};