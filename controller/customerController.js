const userSchema = require('../models/userModel')
const { ObjectId } = require("mongodb");


module.exports = {


    getCustomer :async (req,res) => {
        
        try {
            // if (!req.session.adminId) {
            //     req.flash("error", "Please login");
            //     return res.redirect('/admin');
            // }
            const userData = await userSchema.find()
            res.render('admin/customers',{customers : userData})
            
        } catch (error) {
            console.log("Error in customers get "+error);
        }

    },

    userBlock : async (req,res) => {
        try {
            
console.log(req.params.id);
            const userData = await userSchema.findById({_id : req.params.id})
            userData.isBlocked = !userData.isBlocked
            await userData.save()


            console.log("user id "+ userData);
            res.redirect('/customers')
                     
            
        } catch (error) {
            console.log("Error in blocking user by admin "+error);
            
        }
    },
    
}