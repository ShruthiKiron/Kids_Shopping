const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
      
    wallet : {
        type : Number,
        default : 0
    },
    
    walletHistory : [{
        date : {
            type : Date,
        },
        amount : {
            type : Number
        },
        message : {
            type : String
        }
    
    }],
})
const walletModel = new mongoose.model("wallet", walletSchema);

module.exports = walletModel
