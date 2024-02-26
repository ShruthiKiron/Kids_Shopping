const homeController = require('../controller/homeController')

const router = require('express').Router()

router.get('/home',homeController.getHome)

router.get('/product',homeController.getProduct)


module.exports = router