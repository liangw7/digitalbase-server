var mongoose = require('mongoose');

var visitSchema = new mongoose.Schema({
    diagnosis_type: {// 诊疗类别1:住院;2:门急诊
        type: String
    },
    ipt_no: {// 住院号
        type: String
    },
    desc: {
        type: Object
    },
    patientID: {
        type: String
    },
    providerID: {
        type: String
    },
    provider: {
        type: Object
    },
    patient: {
        type: Object
    },
    patientName: {
        type: String
    },
    providerName: {
        type: String
    },
    patientEmail: {
        type: String
    },

    providerEmail: {
        type: String
    },

    patientGender: {
        type: String
    },
    patientBirthday: {
        type: Date
    },

    providerGender: {
        type: String
    },

    providerSpecialty: {
        type: String
    },

    orderID: {
        type: String
    },
    type: {
        type: String
    },
    followupType: {
        type: String
    },
    profile: {
        type: Object
    },
    profiles: [],
    forms: [],
    status: {
        type: String
    },
    availableAtYear: {
        type: Number
    },
    availableAtMonth: {
        type: Number
    },
    availableAtDate: {
        type: Number
    },
    availableAtHours: {
        type: Number
    },
    availableAtMinutes: {
        type: Number
    },
    reservedAt: {
        type: Date
    },
    visitDate: {
        type: Date
    },
    createdBy: {
        type: Object
    },
    modifiedBy: {
        type: Object
    },
    out_trade_no: {
        type: String
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('visit', visitSchema);