const router = require('express').Router()
const auth = require('../middleware/isAuth')

const passport = require('passport')
const authController = require('../controller/authController')

router.get('/login', auth.userLogin, authController.getLogin)
router.post('/login', auth.userLogin, authController.postLogin)

router.get('/signup', auth.userLogin, authController.getSignup)
router.post('/signup', auth.userLogin, authController.postSignup)

router.get('/signup-otp', auth.userLogin, authController.getSignupOtp)
router.post('/signup-otp', auth.userLogin, authController.postSignupOtp)

router.post('/resend-otp', auth.userLogin, authController.resendOtp)

router.post('/auth/googlesignin',auth.userLogin,authController.googleLogin)

router.get('/forgotPassword', auth.userLogin, authController.getForgotPassword)
router.post('/forgotPassword', auth.userLogin, authController.postForgotPassword)

router.get('/forgotPassword-otp', auth.userLogin, authController.getForgotPasswordOTP)
router.post('/forgotPassword-otp', auth.userLogin, authController.postForgotPasswordOTP)
router.post('/forgot-resend-otp', auth.userLogin, authController.forgotResendotp)

router.get('/newPassword', auth.userLogin, authController.getNewPassword)
router.post('/newPassword', auth.userLogin, authController.postNewPassword)

router.get('/logout', authController.userLogout)

module.exports = router
