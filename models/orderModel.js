const mongoose = require('mongoose')



const orderSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    orderId: {
        type: String,
        required: true
    }
    , orderedAt: {
        type: Date,
        required: true,
        default: Date.now

    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    orderStage: {
        type: String,
        required: true,


    },
    paymentMethod: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        required: true
    },
    cancellationReason: {
        type: String,
        required: true,
        default: 'n/a'
    },
    product: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "product",
            },

            quantity: {
                type: Number,
                default: 1,
            },
            size: {
                type: String,

            },
            price: {
                type: Number
            },

        }]
    ,
    grandTotal: {
        type: Number,
        required: true

    },

})

const orderModel = new mongoose.model('order', orderSchema)
module.exports = orderModel