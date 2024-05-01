const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    product: {
        type: String,
        require: true
    },

    color: {
        type: String,

    },
    price: {
        type: Number,

    },
    size: {
        type: Array,
    },
    image: {
        type: Array,
    },
    description: {
        type: String,
    },
    category: {
        type: String,
        ref: 'category',

    },
    stock: {
        type: Number,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now()
    },
    idealFor: {
        type: String,

    },
    offerFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'offer',
    },
    offerPrice: {
        type: Number
    }



})

const productModel = new mongoose.model('product', productSchema)

module.exports = productModel