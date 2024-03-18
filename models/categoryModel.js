const mongoose = require ('mongoose')

const categorySchema = new mongoose.Schema({
    categoryName : {
        type : String,        
        require : true,
        unique : true,
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    date : {
        type : Date,
        default : Date.now()
    },
    image : {
        type : Array,
    }
        
    
})

const categoryModel = new mongoose.model('category',categorySchema)

module.exports = categoryModel
