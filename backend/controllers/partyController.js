const Party = require('../models/Party');
const path = require('path');
const fs = require('fs');

// Create a new party
exports.createParty = async (req, res) => {
  try {
    const data = req.body;

    // handle logo upload
    if (req.file) {
      data.logoUrl = `/uploads/${req.file.filename}`;
    }

    const party = await Party.create(data);
    res.status(201).json(party);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all parties
exports.getParties = async (req, res) => {
  try {
    const parties = await Party.find();
    res.json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a party (replace logo if uploaded)
exports.updateParty = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    // If new logo uploaded, delete old
    if (req.file) {
      if (party.logoUrl) {
        const oldPath = path.join(__dirname, `..${party.logoUrl}`);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.logoUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete party (and logo file)
exports.deleteParty = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    if (party.logoUrl) {
      const logoPath = path.join(__dirname, `..${party.logoUrl}`);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }

    await party.deleteOne();
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
