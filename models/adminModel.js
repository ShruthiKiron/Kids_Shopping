const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({

    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Boolean,
        default: true
    }
})

const adminModel = new mongoose.model('admin', adminSchema)

module.exports = adminModel