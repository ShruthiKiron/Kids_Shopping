const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const methodOverride = require('method-override')
const flash = require('express-flash')
const passport = require('passport')
const errorController = require("./controller/errorController");
//require('./middleware/googlePassport')
//const bodyParser = require('body-parser')

require('./config/dbConnection')

app.use((req, res, next) => {
    res.header("Cache-Control", "no-store, no-cache, must-revalidate");
    next();
  });

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

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', 0);
  next();
});

app.use(flash())

app.use(methodOverride('_method'));

app.use(passport.initialize())
app.use(passport.session())


app.use('/',authRouter)
app.use('/',homeRouter)
app.use('/',adminRouter)

// app.use((req, res) => {
//     res.status(404).render("user/error");
//   });
  //error handling middleware
app.use(errorController.get404);
app.use("/500", errorController.get500);
app.use(errorController.errorHandler);
  

app.listen(process.env.PORT || 4000,() =>{
    console.log(`server connected to port 4000`)
})