const userSchema = require('../models/userModel')

const verificationController = require('./verificationController')
//const homeController = require('./homeController')
const bcrypt = require('bcrypt')

module.exports = {

    //Getting signup page

    getSignup : (req,res) => {

        res.render('auth/signup')
        ///console.log("user data getSignup  "+req.session.user)

    },

    // signing up using post

    postSignup : async (req,res) =>{
        try{

            const userData =await userSchema.findOne({email : req.body.email})
            if(userData)
            {
                res.redirect('/signup')
            }
            else
        {

             console.log("post" + userData)
            const otp =  verificationController.sendEmail(req.body.email)
            
            req.session.userInfo = {
                firstName : req.body.firstName,
                lastName : req.body.lastName,
                email : req.body.email,
                password : await bcrypt.hash(req.body.password, 12),
                token : {
                    otp : otp,
                generatedTime : Date.now() + 60000

                }
                

            }
        
        
            console.log("post signup time "+req.session.userInfo.token.generatedTime)
            res.render('auth/signup-otp')
        }
        }
        catch(error){
            console.log("Error in postsignup "+error)
        }
    },

    // get signup-otp

    getSignupOtp : async (req,res) =>{

        res.render('auth/signup-otp')
        console.log("Get signup otp")
    },

    // post signup otp

    postSignupOtp : async (req,res)=>{

        try{

            
            const otpValue = req.body.value

            const otp = req.session.userInfo.token.otp

            const otpExpiry = req.session.userInfo.token.generatedTime

           const date = Date.now()
           console.log("Date now" + date)
           console.log("Generated time"+otpExpiry)
           console.log(otpExpiry-date)


            if(date < otpExpiry){
                
            if(otpValue == otp)
            {
                
                const userData =new userSchema( {
                    firstName: req.session.userInfo.firstName,
                    lastName: req.session.userInfo.lastName,
                    email: req.session.userInfo.email,
                    password: req.session.userInfo.password,
                    token : {
                        otp: req.session.userInfo.otp,
                    generatedTime: req.session.userInfo.generatedTime

                    }
                    
                });
                
                await userData.save();
                
                //res.send("Welcome to home page")

                res.render('user/home')
                                
            }

               
            else
            { 
                res.redirect('/signup-otp')
                
                
            }
        }
        else{
            res.send("Time expired")
        }

        }catch(error){
            console.log("Error post sig up "+ error)
        }
    },

    //Resend OTP

    resendOtp : async(req,res) =>{
        try {

        const otp = verificationController.sendEmail(req.session.userInfo.email)

        generatedTime = Date.now() + 60000

        req.session.userInfo.token.otp = otp
        req.session.userInfo.token.generatedTime = generatedTime

        console.log(req.session.userInfo.firstName)

        console.log("New otp"+otp)
        if(otp){
            res.json({success: true,message :`otp has resend to ${req.session.userInfo.email}` })
        }

        }catch(error){
            console.log("Error post sig up "+ error)
        }


    },

    // User get login

    getLogin : (req,res) => {
        console.log("Login page")
        res.render('auth/login',{error : req.flash('error')})
    },

    // User post login

    postLogin : async (req,res) => {
        try {
            const userData =await userSchema.findOne({email : req.body.email})
            if(userData)
            {
                const passwordMatch = await bcrypt.compare(req.body.password,userData.password)
                if(passwordMatch)
               {
                if(!userData.isBlocked){
                    req.session.user = true;
                    
                    res.redirect('/home') }
               else{
                
                req.flash('error', 'User is Blocked')
               }

                }
                else{
                    req.flash('error', 'Incorrect Password')
                    res.redirect('/login')
                   }
                
            }
            else{
                req.flash('error','User doest exist')
                res.redirect('/login')
            }
           console.log('Login error'+error) 
            }
        
        catch(error){}
    },
    
    googleLogin : async(req,res) => {
        try {
            req.session.user = req.user;
        res.redirect('/home');
        } catch (error) {
            console.log("Error in google login "+error);
        }
    }

    }


