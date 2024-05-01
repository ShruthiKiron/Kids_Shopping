const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  items: [
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

    }
  ],
});



const cartModel = new mongoose.model('cart', cartSchema)
module.exports = cartModel