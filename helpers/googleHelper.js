const {OAuth2Client} = require('google-auth-library')
const client = new OAuth2Client()

module.exports = {
    verifyGoogleToken : async (token) =>{
        try {
            const ticket = await client.verifyIdToken({
                idToken : token,
                audience : process.env.CLIENT_ID
            });
            const payLoad = ticket.getPayload()
            return payLoad
            
        } catch (error) {
            console.log(error);
        }

    }
}