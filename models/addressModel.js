const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  address: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true
  }
});

const addressModel = new mongoose.model('address', addressSchema)

module.exports = addressModel