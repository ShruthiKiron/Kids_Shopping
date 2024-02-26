const router = require('express').Router()
const adminController = require('../controller/adminController')
const categoryCotroller = require('../controller/categoryCotroller')
const customerController = require('../controller/customerController')
const productController = require('../controller/productController')
const upload = require('../middleware/multer')


router.get('/adminSignup',adminController.getAdminSignup)
router.post('/adminSignup',adminController.postAdminSignup)

router.get('/admin',adminController.getAdminLogin)
router.post('/admin',adminController.postAdminLogin)

router.get('/dashboard',adminController.getDashboard)

router.get('/customers',customerController.getCustomer)

router.get('/userBlock/:id',customerController.userBlock)

router.get('/category',categoryCotroller.getCategory)
router.post('/category',categoryCotroller.addCategory)

router.get('/editCategory/:id',categoryCotroller.getEditCategory)
router.patch('/editCategory/:id',categoryCotroller.patchEditCategory)


router.delete('/deleteCategory/:id',categoryCotroller.deleteCategory)

router.get('/products',productController.getProduct)

router.get('/addProducts',productController.getAddProducts)
router.post('/addProducts',upload.array('images',3),productController.postAddProducts)

router.get('/editProduct/:id',productController.getEditProduct)
router.patch('/editProduct/:id',upload.array('images',3),productController.patchEditProduct)

router.delete('/deleteProduct/:id',productController.deleteProduct)

 

// router.post('/admin',adminController.postAdminLogin)
// router.get('/dashboard',adminController.getDashboard)

module.exports = router