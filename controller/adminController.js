const adminSchema = require('../models/adminModel')
const userSchema = require('../models/userModel')
const categorySchema = require('../models/categoryModel')

const bcrypt = require('bcrypt')

module.exports = {
    //admin signup

    getAdminSignup : async (req,res) => { 
        res.render('admin/adminSignup')
    },

    postAdminSignup : async (req,res) => {
        try {

            const adminData = await adminSchema.findOne({email : req.body.email})

            console.log(req.body.password)

            if(adminData){
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
        res.render('admin/admin')
    },

    //post Admin login

    postAdminLogin : async ( req,res) => {
        try {
            const adminData = await adminSchema.findOne({email : req.body.email})
            if(!adminData){
                res.redirect('/admin')
            }
            else{
              const passwordMatch = await bcrypt.compare(req.body.password,adminData.password)
                if(passwordMatch)
                {
                    res.redirect('/dashboard')
                }
                else{
                    res.send('Wrong Password')
                }
            }
            
        } catch (error) {
            console.log("Error in admin login "+error);
            
        }
    },

    getDashboard : (req,res) => {
        res.render('admin/dashboard')
    },

    
}