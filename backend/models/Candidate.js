const mongoose = require('mongoose');

const candidateSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    currentParty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: true,
    },
    elections: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Election' }
    ],
    bio: {
        type: String,
    },
    dob:{
        type: Date,
    },
    imageUrl: {
        type: String,
    },
    participatedFrom: {
        type: String,
        enum: [
            'national',
            'district',
            'province',
            'municipal',
            'urban',
            'pradeshiya-sabha'
        ],
        required: true
    },
    regionName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Region',
        required: function() {
            // required only if not national-level
            return this.participatedFrom !== 'national';
        }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Candidate', candidateSchema);