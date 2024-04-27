const session = require('express-session')
const userSchema = require('../models/userModel')


module.exports = {

userLogin : async(req,res,next) =>{
    try {
        if(req.session.userId){
            res.redirect('/home')
        }else{
            next();
        }
      } catch (error) {
        
    }
},
adminLogin : async(req,res,next) => {
    try {
        if(req.session.adminId){
            res.redirect('/admin')

        }
        else{
            next()
        }
        
    } catch (error) {
        console.log("Error in admin login middleware "+error);
    }

},

adminLoggedIn : async(req,res,next)=>{
    try {
        if(req.session.adminId){
            next()
        }
        else{
            req.flash("error", "Please login");
            res.redirect('/admin')
        }
        
    } catch (error) {
        
    }
}
}