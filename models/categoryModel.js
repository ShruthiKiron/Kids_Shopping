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
    }
        
    
})

const categoryModel = new mongoose.model('category',categorySchema)

module.exports = categoryModel
