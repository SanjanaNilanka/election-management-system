const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    candidates: [
        {
            candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
            party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
            votes: { type: Number, default: 0}
        }
    ],
    type: { 
        type: String, 
        enum: ['presidential', 'parliamentary', 'provincial', 'local'], 
        required: true 
    },
    level: { 
        type: String, 
        enum: ['national', 'district', 'provincial', 'local'], 
        required: true 
    },
    votes: [
        {
            voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter', required: true },
            candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
            votedAt: { type: Date, default: Date.now }
        }
    ],
    start: { 
        date:{
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    },
    end: { 
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        }
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
    },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'closed'], 
        default: 'pending' 
    },
    }, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);