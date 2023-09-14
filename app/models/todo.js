var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
    name: {
        type: String
    },
    title: {
        type: String
    },
    status: {
        type: String
    },
    type: {
        type: String
    },
    content: {
        type: String
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    profileID: {
        type: String
    },
    providerIDs: [],
    patientIDs: [],
    profileIDs: [],
    requesterID: {
        type: String
    },
    messages: [],
    detail: Object
}, {
    timestamps: true
});

module.exports = mongoose.model('Todo', TodoSchema);