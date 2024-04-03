const mongoose = require('mongoose')
require('dotenv').config()

async function connectDB(){
    try{
        const DB_URL = process.env.DB_URL
        await mongoose.connect(DB_URL)
        console.log("DB connected")

    }
    catch(error){
        console.log("Error in connectDb "+error)
    }
}

module.exports = connectDB()
