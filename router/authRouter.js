const router = require('express').Router()
require('../middleware/googlePassport')


const passport = require('passport')
const authController = require('../controller/authController')

router.get('/login',authController.getLogin)
router.post('/login',authController.postLogin)

router.get('/signup',authController.getSignup)
router.post('/signup',authController.postSignup)

router.get('/signup-otp',authController.getSignupOtp)
router.post('/signup-otp',authController.postSignupOtp)

router.post('/resend-otp',authController.resendOtp)

router.get('/auth/google',passport.authenticate('google',{scope : ['email','profile']}))
router.get('/auth/google/home',passport.authenticate('google'),authController.googleLogin)



module.exports = router
