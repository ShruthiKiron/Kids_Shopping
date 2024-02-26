const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const methodOverride = require('method-override')
const flash = require('express-flash')
const passport = require('passport')

//const bodyParser = require('body-parser')

require('./config/dbConnection')

const authRouter = require('./router/authRouter')
const homeRouter = require('./router/homeRouter')
const adminRouter = require('./router/adminRouter')

app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'template')))
app.use(express.static(path.join(__dirname,'userTemplate')))

app.set('view engine', 'ejs')
app.set('views',__dirname+'/views')

app.use(express.urlencoded({extended:false}))

app.use(express.json())

app.use(flash())

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(methodOverride('_method'));

app.use(passport.initialize())
app.use(passport.session())


app.use('/',authRouter)
app.use('/',homeRouter)
app.use('/',adminRouter)

app.listen(process.env.PORT || 4000,() =>{
    console.log(`server connected to port 4000`)
})