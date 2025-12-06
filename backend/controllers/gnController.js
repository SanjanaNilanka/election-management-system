const GN = require('../models/GN');
const User = require('../models/User');

exports.getAllGNs = async (req, res) => {
  try {
    const gns = await GN.find().populate('user', 'name email role');
    res.json(gns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGN = async (req, res) => {
  const { name, email, password, province, district, gnDivision } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, role: 'grama_niladhari' });
    const gn = await GN.create({ user: user._id, province, district, gnDivision });
    res.status(201).json(gn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGN = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, province, district, gnDivision } = req.body;
    try {
    const gn = await GN.findById(id).populate('user');
    if (!gn) return res.status(404).json({ message: 'GN not found' });  
    const user = await User.findById(gn.user._id);
    if (!user) return res.status(404).json({ message: 'Associated user not found' });
    user.name = name || user.name;
    user.email = email || user.email;
    if (password) user.password = password;
    await user.save();
    gn.province = province || gn.province;
    gn.district = district || gn.district;
    gn.gnDivision = gnDivision || gn.gnDivision;
    await gn.save();
    res.json(gn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteGN = async (req, res) => {
    const { id } = req.params;
    try {
    const gn = await GN.findByIdAndDelete(id);
    if (!gn) return res.status(404).json({ message: 'GN not found' });
    await User.findByIdAndDelete(gn.user);
    res.json({ message: 'GN and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGNById = async (req, res) => {
  const { id } = req.params;
    try {
    const gn = await GN.findById(id).populate('user', 'name email role');
    if (!gn) return res.status(404).json({ message: 'GN not found' });
    res.json(gn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGNByUserId = async (req, res) => {
  const { userId } = req.params;
    try {
    const gn = await GN.findOne({ user: userId }).populate('user', 'name email role');
    if (!gn) return res.status(404).json({ message: 'GN not found for this user' });
    res.json(gn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/gnController.js

exports.getGNByDivisionName = async (req, res) => {
  try {
    const { divisionName } = req.params;

    // Case-insensitive + trim search
    const gn = await GN.findOne({
      gnDivision: { $regex: `^${divisionName.trim()}$`, $options: 'i' }
    }).populate('user', 'name email phone');

    if (!gn) {
      return res.status(404).json({ message: "No Grama Niladhari found for this division" });
    }

    res.json(gn);
  } catch (error) {
    console.error("Error fetching GN by division:", error);
    res.status(500).json({ message: "Server error" });
  }
};