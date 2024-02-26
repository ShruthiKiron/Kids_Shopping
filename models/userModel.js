const mongoose = require('mongoose')

const userSchema =new mongoose.Schema({

    firstName : {
        type : String,
        required : true
    },

    lastName : {
        type : String,
        required : true
    },

    email : {
        type : String,  
        unique : true,
        lowercase : true

    },

    googleId : {
        type : String
    },

    
    // mobile : {
    //     type : String,
    //     required : true
    // },

    password : {
        type : String,
        required : true
    },

    token : {
        otp : {
            type : Number
        },
        genereatedTime : {
            type : Date
        }
    },
    isBlocked :{
        type : Boolean,
        default : false
    }




})

const userModel = new mongoose.model('users',userSchema)

module.exports = userModel
