const Voter = require('../models/Voter');
const path = require('path');

const toRelativePath = (file) => file ? path.relative(path.join(__dirname, '../'), file.path).replace(/\\/g, '/') : null;

const registerVoterWithDocs = async (req, res) => {
  const { userId, nic, phone, address, province, district, gramaNiladhariDivision, localAuthority } = req.body;
  const voterNumber = `VOTER-${Date.now()}`;

  try {
    const nicFrontPath = toRelativePath(req.files.nic_front?.[0]);
    const nicBackPath = toRelativePath(req.files.nic_back?.[0]);
    const birthCertFrontPath = toRelativePath(req.files.birth_cert_front?.[0]);
    const birthCertBackPath = toRelativePath(req.files.birth_cert_back?.[0]);

    const voter = await Voter.create({
      user: userId,
      nic,
      phone,
      address,
      province,
      district,
      gramaNiladhariDivision,
      localAuthority,
      registered: true,
      status: 'pending',
      voterNumber,
      nicFrontPath,
      nicBackPath,
      birthCertFrontPath,
      birthCertBackPath,
      nicApproval: 'pending',
      birthCertificateApproval: 'pending',
      addressApproval: 'pending'
    });

    res.status(201).json(voter);
  } catch (error) {
    console.error('Error registering voter:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new voter
// @route   POST /api/voter/register
// @access  Public
const registerVoter = async (req, res) => {
    const { userId, nic, phone, address, province, district, gramaNiladhariDivision } = req.body;

    try {
        const voter = await Voter.create({
            user: userId,
            nic,
            phone,
            address,
            province,
            district,
            gramaNiladhariDivision,
            status: 'pending'
        });

        res.status(201).json(voter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get all voters
// @route   GET /api/voter
// @access  Public
const getVoters = async (req, res) => {
    try {
        const voters = await Voter.find({}).populate('user', 'name email role');
        res.json(voters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Approve a voter
// @route   PUT /api/voter/:id/approve
// @access  Public
const approveVoter = async (req, res) => {
    const { id } = req.params;

    try {
        const voter = await Voter.findById(id);
        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }

        voter.status = 'approved';
        await voter.save();

        res.json(voter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Reject a voter
// @route   PUT /api/voter/:id/reject
// @access  Public
const rejectVoter = async (req, res) => {
    const { id } = req.params;

    try {
        const voter = await Voter.findById(id);
        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }

        voter.status = 'rejected';
        await voter.save();

        res.json(voter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get a voter by ID
// @route   GET /api/voter/:id
// @access  Public
const getVoterById = async (req, res) => {
    const { id } = req.params;

    try {
        const voter = await Voter.findById(id).populate('user', 'name email role');
        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }
        res.json(voter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getVoterByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const voter = await Voter.findOne({ user: userId }).populate('user', 'name email role');
        
        if (!voter) {
            return res.status(404).json({ message: 'Voter not found for this user.' });
        }

        res.status(200).json(voter);
    } catch (error) {
        console.error('Error fetching voter by user ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// @desc    Update a voter's details
// @route   PUT /api/voter/:id
// @access  Public
const updateVoter = async (req, res) => {
    const { id } = req.params;
    const { nic, phone, address, province, district, gramaNiladhariDivision, status, nicApproval, birthCertificateApproval, addressApproval } = req.body;

    try {
        const voter = await Voter.findById(id);
        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }

        voter.nic = nic || voter.nic;
        voter.phone = phone || voter.phone;
        voter.address = address || voter.address;
        voter.province = province || voter.province;
        voter.district = district || voter.district;
        voter.gramaNiladhariDivision = gramaNiladhariDivision || voter.gramaNiladhariDivision;
        voter.status = status || voter.status;
        voter.nicApproval = nicApproval || voter.nicApproval;
        voter.birthCertificateApproval = birthCertificateApproval || voter.birthCertificateApproval;
        voter.addressApproval = addressApproval || voter.addressApproval;

        await voter.save();
        res.json(voter);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Delete a voter
// @route   DELETE /api/voter/:id
// @access  Public
const deleteVoter = async (req, res) => {
    const { id } = req.params;

    try {
        const voter = await Voter.findById(id);
        if (!voter) {
            return res.status(404).json({ message: 'Voter not found' });
        }

        await voter.remove();
        res.json({ message: 'Voter removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    registerVoter,
    getVoters,
    approveVoter,
    rejectVoter,
    getVoterById,
    getVoterByUserId,
    updateVoter,
    deleteVoter,
    registerVoterWithDocs
};