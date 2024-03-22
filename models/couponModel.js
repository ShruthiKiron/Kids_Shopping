const mongoose = require("mongoose");

const couponSchema = mongoose.Schema({
  
  // userId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  // },
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },
});
const couponModel = new mongoose.model('coupon' ,couponSchema)
module.exports = couponModel
