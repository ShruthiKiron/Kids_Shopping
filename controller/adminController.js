const adminSchema = require('../models/adminModel')
const userSchema = require('../models/userModel')
const categorySchema = require('../models/categoryModel')

const bcrypt = require('bcrypt')

module.exports = {
    //admin signup

    getAdminSignup : async (req,res) => { 
        res.render('admin/adminSignup',{ error: req.flash("error") })
    },

    postAdminSignup : async (req,res) => {
        try {

            const adminData = await adminSchema.findOne({email : req.body.email})

            console.log(req.body.password)

            if(adminData){
                req.flash("error", "Admin already exist");
                res.redirect('/adminSignup')
            }
            else{
                 
                const adminInfo = new adminSchema({
                    email : req.body.email,
                    password : await bcrypt.hash(req.body.password, 12),
                })
                 await adminInfo.save()
                 console.log("hashed password "+adminInfo.password)

            res.redirect('/admin')
            }
            
            
        } catch (error) {
            console.log("Error in admin signup " +error)
            
        }
    },





    //get Admin login

    getAdminLogin : async (req,res) => {
        res.render('admin/admin',{ error: req.flash("error") })
    },

    //post Admin login

    postAdminLogin : async ( req,res) => {
        try {
            const adminData = await adminSchema.findOne({email : req.body.email})
            if(!adminData){
                req.flash("error", "Admin dosen't exist");
                res.redirect('/admin')
            }
            else{
              const passwordMatch = await bcrypt.compare(req.body.password,adminData.password)
                if(passwordMatch)
                {
                    req.session.admin = true;
                    req.session.adminId = adminData._id;
                    console.log("admin id "+req.session.adminId);
                    res.redirect('/dashboard')
                }
                else{
                    req.flash("error", "Incorrect Password");
                    res.redirect('/admin')
                }
            }
            
        } catch (error) {
            
            console.log("Error in admin login "+error);
            
        }
    },
    adminLogout : async (req,res) => {
        try{
           console.log('logout')
           delete req.session.adminId
          
           res.redirect('/admin')
        }catch(er)
        {
          console.log(er)
        }
      },

    getDashboard : (req,res) => {
        if(req.session.adminId){
            res.render('admin/dashboard')
        }
        else{
            req.flash("error","Please login")
            res.redirect('/admin')
        }
        
    },

    
}