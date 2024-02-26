const userSchema = require('../models/userModel')
const { ObjectId } = require("mongodb");


module.exports = {


    getCustomer :async (req,res) => {
        
        try {
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
            console.log(userData);
            if(userData.isBlocked == true)
            {
                await userSchema.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { isBlocked: false } }
              );
                 

            }
            else{
                await userSchema.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: { isBlocked: true } }
                  );

            }

            console.log("user id "+ userData);
            res.redirect('/customers')
                     
            
        } catch (error) {
            console.log("Error in blocking user by admin "+error);
            
        }
    },
    
}