const mongoose = require('mongoose');

const voterSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'User',
        required: true,
    },
    nic: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    registered: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    province: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    gramaNiladhariDivision: {
        type: String,
        required: true,
    },
    localAuthority: {
        type: String,
        trim: true,
    },
    nicFrontPath: { type: String },
    nicBackPath: { type: String },
    birthCertFrontPath: { type: String },
    birthCertBackPath: { type: String },
    nicApproval: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    birthCertificateApproval: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    addressApproval: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    voterNumber: {
        type: String,
        sparse: true,
        default: null, 
    }
}, {   
    timestamps: true,
});

const Voter = mongoose.model('Voter', voterSchema);
module.exports = Voter;