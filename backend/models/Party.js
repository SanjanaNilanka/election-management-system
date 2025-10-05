const mongoose = require('mongoose');

const partySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    abbreviation: {
        type: String,
        required: true,
        unique: true,
    },
    logoUrl: {
        type: String,
    },
    color: {
        type: String,
    },
    foundedYear: { 
        type: Number 
    },
    description: { 
        type: String 
    },
}, {
    timestamps: true,
});
module.exports = mongoose.model('Party', partySchema);