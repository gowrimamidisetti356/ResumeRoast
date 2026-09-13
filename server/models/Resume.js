const mongoose = require('mongoose');

const resumeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fileName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
    },
    initialAnalysis: {
        type: Object, // Stores the mocked or real analysis provided at upload
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
