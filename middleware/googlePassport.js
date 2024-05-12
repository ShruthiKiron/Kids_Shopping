const passport = require('passport')
const userSchema = require('../models/userModel')
const GoogleStrategy = require('passport-google-oauth2').Strategy

// passport.serializeUser((user, done) => {
//     done(null, user)
// })
passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
  passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
  });
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:4000/auth/google/callback',
    //passReqToCallback: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userSchema.findOne({ googleId: profile.id })
        console.log("user :" + user)
        if (!user) {
            user = new userSchema({
                firstName: profile.given_name,
                lastName: profile.family_name,
                email: profile.email
            })

            await user.save()
        }
        console.log("user " + user)
        return done(null, user._id);
    } catch (error) {
        console.log("error " + error)
        return done(error, null);
    }

}));

// passport.serializeUser((user, done) => {
//     done(null, user._id);
// });

// passport.deserializeUser(async (userId, done) => {
//     try {
//         const user = await userSchema.findById(userId);
//         done(null, user);
//     } catch (error) {
//         done(error, null);
//     }
// });






