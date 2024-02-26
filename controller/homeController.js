const userSchema = require('../models/userModel')
const productSchema = require('../models/productModel')

module.exports = {

    getHome :async (req,res) =>{
        try {
            const productData = await productSchema.find()            
            console.log(productData);
        res.render('user/home',{ products : productData })
        } catch (error) {
            console.log("Error in get home "+error);
        }
        
    },

    getProduct : async (req,res) => {
        try {
            const product = await productSchema.find()
            res.render('user/product',{product})
        } catch (error) {
            console.log("Error in get user product "+error);
            
        }
    },


}