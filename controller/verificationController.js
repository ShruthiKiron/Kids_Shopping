const nodeMailer = require('nodemailer')
const otpgenerator = require('otp-generator')
require('dotenv').config()

const transporter =  nodeMailer.createTransport({
    service: 'gmail',
    auth:
    {
        user : process.env.APP_EMAIL,
        pass: process.env.APP_PASS
    }
});

function generateOtp(){
    try{
        const otp = otpgenerator.generate(6,{
            lowerCaseAlphabets : false,
            upperCaseAlphabets : false,
            specialChars : false
        })
        return otp
    }
    catch(error){
        console.log("generateOtp error "+error)
    }
}

module.exports = {
    
    sendEmail : (email) =>{
        try{
            const otp = generateOtp()
                console.log(otp)
                transporter.sendMail({
                    to : email,
                    from : process.env.APP_EMAIL,
                    subject : 'OTP Verification',
                    html : `<h1>Hello , Your OTP is ${otp}</h1>`
                })
                return otp


        }
        catch(error){
            console.log("Error sendEmail "+error)
        }

    }


}

