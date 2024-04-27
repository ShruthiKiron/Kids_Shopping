const homeController = require('../controller/homeController')
const userController = require('../controller/userController')
const auth = require('../middleware/isAuth')

const router = require('express').Router()

router.get('/home',homeController.getHome)
router.get('/',homeController.getHome)


router.get('/product',homeController.getProduct)

router.post('/search',homeController.postSearch)
router.post('/filter-and-sort',homeController.postFilter)

router.get('/userProfile/:id',userController.getUserProfile)

router.get('/editProfile/:id',userController.getEditProfile)
router.patch('/editProfile/:id',userController.patchEditProfile)

//add address route
router.get('/addAddress',userController.getAddAddress)
router.post('/addAddress/:id' ,userController.postAddAddress)
//
//edit address
router.get('/editAddress/:id',userController.getEditAddress)
router.post('/editAddress/:id',userController.postEditAddress)
//delete Address
router.patch('/deleteAddress/:id',userController.patchDeleteAddress)

router.get('/changePassword/:id',userController.getChangePassword)
router.post('/changePassword/:id',userController.postChangePassword)

router.get('/productDetail/:id',homeController.getProductDetail)

router.get('/cart/:id',userController.getUserCart)

router.post('/add_to_cart',userController.postAddCart)
router.delete('/deleteItemCart/:id',userController.deleteItemCart)

router.get('/checkout',userController.getCheckout)

router.patch('/cart/change_quantity/:id',userController.changeCartQuantity)

router.get('/order-success',userController.getOrderSuccess)
router.get('/view-order/:id',userController.getOrderDetail)
router.post('/place-order',userController.postPlaceOrder)
router.get('/order-history/:id',userController.getOrderHistory)
router.post('/cancel-order/:id',userController.postCancelOrder)
router.patch('/return-order/:id',userController.returnOrder)
router.post('/verify_payment',userController.postVerifyPayment)
//router.post('/create-order',userController.createRazorpayOrder)

router.get('/wishlist/:id',homeController.getWishlist)
router.post('/add-wishlist',homeController.addWishlist)
router.delete('/delete-wishlist/:id',homeController.deleteWishlist)

router.get('/wallet/:id',homeController.getWallet)

router.post('/apply-coupon',homeController.applyCoupon)
router.patch('/remove-coupon', homeController.removeCoupon);

router.patch('/retry-payment/:id',userController.retryPayment)
router.get('/filteredOrders',userController.getfilteredOrders)



module.exports = router