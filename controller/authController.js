const userSchema = require("../models/userModel");
const walletSchema = require('../models/walletModel')

const verificationController = require("./verificationController");
const bcrypt = require("bcrypt");

module.exports = {
  //Getting signup page

  getSignup: (req, res) => {
    res.render("auth/signup", { error: req.flash("error") });
  },

  // signing up using post

  postSignup: async (req, res) => {
    try {
      const userData = await userSchema.findOne({ email: req.body.email });
      if (userData) {
        req.flash("error", "User already exist");
        res.redirect("/signup");
      } else {
        const otp = verificationController.sendEmail(req.body.email);

        req.session.userInfo = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: await bcrypt.hash(req.body.password, 12),
          token: {
            otp: otp,
            generatedTime: Date.now() + 60000,
          },
          isReferred: req.body.isReferred,
        };
        console.log("otp" + otp);
        console.log(
          "post signup time " + req.session.userInfo.token.generatedTime
        );
        console.log("is Referred ", req.session.userInfo.isReferred);
        res.redirect("/signup-otp");
      }
    } catch (error) {
      console.log("Error in postsignup " + error);
    }
  },

  // get signup-otp

  getSignupOtp: async (req, res) => {
    res.render("auth/signup-otp");
    console.log("Get signup otp");
  },

  // post signup otp

  postSignupOtp: async (req, res) => {
    try {
      const otpValue = req.body.value;
      console.log(req.body.value);
      const otp = req.session.userInfo.token.otp;
      const otpExpiry = req.session.userInfo.token.generatedTime;
      const date = Date.now();
      console.log("DAte", date);
      console.log("time", otpExpiry);
      const refferedUser = await userSchema.find({ referralCode: req.session.userInfo.isReferred })
      console.log("reffered " + refferedUser);

      if (date < otpExpiry) {
        if (otpValue == otp) {
          const referralCode = verificationController.referralCodeGenerator()
          const userData = {
            firstName: req.session.userInfo.firstName,
            lastName: req.session.userInfo.lastName,
            email: req.session.userInfo.email,
            password: req.session.userInfo.password,

            referralCode: referralCode,
            token: {
              otp: req.session.userInfo.otp,
              generatedTime: req.session.userInfo.generatedTime,
            },
          };

          const user = await userSchema.insertMany(userData);
          req.session.userId = user[0]._id;
          await walletSchema.insertMany({ userId: req.session.userId })
          await walletSchema.updateOne({ userId: req.session.userId }, {
            $inc: {
              wallet: 100
            },
            $push: {
              walletHistory: {
                date: Date.now(),
                amount: 100,
                message: "Join bonus"
              }
            }
          })


          if (refferedUser) {
            await walletSchema.updateOne({ userId: refferedUser._id }, {
              $inc: {
                wallet: 50
              },
              $push: {
                walletHistory: {
                  date: Date.now(),
                  amount: 50,
                  message: "Referral bonus"
                }
              }
            })

            await walletSchema.updateOne({ userId: req.session.userId }, {
              $inc: {
                wallet: 50
              },
              $push: {
                walletHistory: {
                  date: Date.now(),
                  amount: 50,
                  message: "Referral bonus for referring a user"
                }
              }
            })

          }



          res.json({ success: true });
        } else {
          res.json({ invalid: true, message: "Invalid OTP" });
        }
      } else {
        res.json({ invalid: true, message: "Time Expired" });
      }
    } catch (error) {
      console.log("Error post signup otp " + error);
    }
  },

  //Resend OTP

  resendOtp: async (req, res) => {
    try {
      const otp = verificationController.sendEmail(req.session.userInfo.email);

      generatedTime = Date.now() + 60000;

      req.session.userInfo.token.otp = otp;
      req.session.userInfo.token.generatedTime = generatedTime;

      console.log(req.session.userInfo.firstName);

      console.log("New otp" + otp);
      if (otp) {
        res.json({
          success: true,
          message: `otp has resend to ${req.session.userInfo.email}`,
        });
      }
    } catch (error) {
      console.log("Error resendp " + error);
    }
  },

  // User get login

  getLogin: async (req, res) => {
    try {
      res.render("auth/login", { error: req.flash("error") });
    } catch (error) {
      console.log("Error in get login " + error);
    }
  },

  // User post login

  postLogin: async (req, res) => {
    try {
      const userData = await userSchema.findOne({ email: req.body.email });
      console.log("User just login " + userData);

      console.log("user id " + req.session.userId);
      if (userData) {
        const passwordMatch = await bcrypt.compare(
          req.body.password,
          userData.password
        );
        if (passwordMatch) {
          if (!userData.isBlocked) {
            req.session.user = true;
            req.session.userId = userData._id;
            console.log("user id when password match " + req.session.userId);
            res.redirect("/home");
          } else {
            req.flash("error", "User is Blocked");
            res.redirect("/login");
          }
        } else {
          req.flash("error", "Incorrect Password");
          res.redirect("/login");
        }
      } else {
        req.flash("error", "User doesn't exist");
        res.redirect("/login");
      }
      console.log("Login error" + error);
    } catch (error) { }
  },

  googleLogin: async (req, res) => {
    try {
      req.session.user = req.user;
      res.redirect("/home");
    } catch (error) {
      console.log("Error in google login " + error);
    }
  },
  getForgotPassword: async (req, res) => {
    try {
      res.render("auth/forgotPassword");
    } catch (error) {
      console.log("Error in get forgot password");
    }
  },

  postForgotPassword: async (req, res) => {
    try {
      const userEmail = await userSchema.findOne({ email: req.body.email });
      if (userEmail) {
        req.session.userEmail = userEmail.email;
        const otp = verificationController.sendEmail(req.session.userEmail);
        const generatedTime = Date.now() + 60000;

        req.session.otp = otp;
        req.session.generatedTime = generatedTime;
        res.redirect("forgotPassword-otp");
      }
    } catch (error) {
      console.log("Error in post forgot password " + error);
    }
  },
  forgotResendotp: async (req, res) => {
    try {
      const otp = verificationController.sendEmail(req.session.userEmail);
      const generatedTime = Date.now() + 60000;
      req.session.otp = otp;
      req.session.generatedTime = generatedTime;
      if (otp) {
        res.json({
          success: true,
          message: `otp has resend to ${req.session.userEmail}`,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  getForgotPasswordOTP: async (req, res) => {
    try {
      res.render("auth/forgotPassword-otp");
    } catch (error) {
      console.log("Error in get forgot password otp " + error);
    }
  },
  postForgotPasswordOTP: async (req, res) => {
    try {
      const otpValue = req.body.otpvalue;
      const otpTime = Date.now();
      if (otpTime < req.session.generatedTime) {
        if (otpValue == req.session.otp) {
          res.redirect("/newPassword");
        } else {
          res.redirect("forgotPassword-otp");
        }
      } else {
        res.send("Time Expired");
      }
    } catch (error) {
      console.log("Error in post forgot password otp " + error);
    }
  },
  forgotPasswordResendOTP: async (req, res) => {
    try {
      const resendOtp = verificationController.sendEmail(req.session.userEmail);
      const reGeneratedTime = Date.now() + 60000;

      req.session.otp = resendOtp;
      req.session.generatedTime = reGeneratedTime;

      console.log("New otp" + resendOtp);
      if (resendOtp) {
        res.json({
          success: true,
          message: `otp has resend to ${req.session.userEmail}`,
        });
      }
    } catch (error) {
      console.log("Error in resend otp for forgot password " + error);
    }
  },
  getNewPassword: async (req, res) => {
    try {
      res.render("auth/newPassword");
    } catch (error) {
      console.log("Error get new password " + error);
    }
  },
  postNewPassword: async (req, res) => {
    try {

      const newPassword = req.body.password;
      const confirmPassword = req.body.confirmPassword;
      const userEmail = req.session.userEmail;
      console.log("userEmail " + userEmail);
      if (newPassword == confirmPassword) {
        const passwordMatch = await bcrypt.hash(newPassword, 12);
        await userSchema.updateOne(
          { email: userEmail },
          {
            $set: {
              password: passwordMatch,
            },
          }
        );
        res.redirect("/login");
      } else {
        res.redirect("/newPassword");
      }
    } catch (error) {
      console.log("Error in post new password " + error);
    }
  },
  userLogout: async (req, res) => {
    try {
      console.log('logout')
      delete req.session.userId
      res.redirect('/home')
    } catch (er) {
      console.log(er)
    }
  }
};
