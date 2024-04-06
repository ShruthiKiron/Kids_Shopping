const mongoose = require('mongoose')
const offerSchema =  mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    
    offerType : {
        type : String,
        required : true
    },
    offerFor:{
        type : String,
    },

    startDate : {
        type : Date,
        required : true
    },

    expiryDate : {
        type : Date,
        required : true
    },

    percentage : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean, 
        default : true
    }

})
const offerModel = new mongoose.model('offer' ,offerSchema)
module.exports = offerModel