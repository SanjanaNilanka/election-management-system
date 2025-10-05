const Candidate = require('../models/Candidate');
const path = require('path');
const fs = require('fs');

// Create a new candidate
exports.createCandidate = async (req, res) => {
  try {
    const data = req.body;

    // If image uploaded, set imageUrl
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    const candidate = await Candidate.create(data);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all candidates
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('currentParty regionName');
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get candidate by ID
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('currentParty regionName');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update candidate (and replace image if new uploaded)
exports.updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    // If a new image uploaded, delete old one (optional)
    if (req.file) {
      if (candidate.imageUrl) {
        const oldPath = path.join(__dirname, `..${candidate.imageUrl}`);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete candidate (optional: remove image from disk)
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (candidate.imageUrl) {
      const imagePath = path.join(__dirname, `..${candidate.imageUrl}`);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await candidate.deleteOne();
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
