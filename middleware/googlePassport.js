const passport = require('passport')
const userSchema = require('../models/userModel')
const GoogleStrategy = require('passport-google-oauth2').Strategy

passport.serializeUser((user,done) => {
    done(null,user)
})
passport.use(new GoogleStrategy({
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL:'https://localhost:4000/auth/google/home',
    passReqToCallback:true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userSchema.findOne({googleId : profile.id})

        if(!user)
        {
            user = new userSchema({
                firstName : profile.given_name,
                lastName : profile.family_name,
                email : profile.email
            })

            await user.save()
        }
        // Store user information in session or database
    return done(null, user.id);
    } catch (error) {
        return done(error, null);
    }
    
}));

passport.serializeUser((user, done) => {
    // Serialize user by storing the user ID in the session
    done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
    try {
        // Deserialize user by retrieving user from the database using the user ID
        const user = await userSchema.findById(userId);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});






    