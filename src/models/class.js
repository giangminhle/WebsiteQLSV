const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Class', classSchema);