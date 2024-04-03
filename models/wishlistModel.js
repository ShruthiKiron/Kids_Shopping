const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId
    },
    productId :[{
        type : mongoose.Schema.Types.ObjectId
    }]
})

const wishlistModel = new mongoose.model('wishlist',wishlistSchema)
module.exports = wishlistModel