const router = require("express").Router();
const adminController = require("../controller/adminController");
const categoryCotroller = require("../controller/categoryCotroller");
const customerController = require("../controller/customerController");
const productController = require("../controller/productController");
const orderController = require("../controller/orderController")
const upload = require("../middleware/multer");
const auth = require('../middleware/isAuth');
const couponController = require("../controller/couponController");
const offerController = require("../controller/offerController");

router.get("/adminSignup",auth.adminLogin , adminController.getAdminSignup);
router.post("/adminSignup",auth.adminLogin , adminController.postAdminSignup);

router.get("/admin",auth.adminLogin ,adminController.getAdminLogin);
router.post("/admin",auth.adminLogin , adminController.postAdminLogin);

router.get('/adminLogout',adminController.adminLogout)

router.get("/dashboard",auth.adminLoggedIn, adminController.getDashboard);
router.get("/dashboard-stat",auth.adminLoggedIn, adminController.getDashboardStat)
router.get('/salesreport',auth.adminLoggedIn, adminController.getSalesreport)
router.get('/top-selling-products',auth.adminLoggedIn, adminController.getTopProducts)
router.get('/top-selling-categories',auth.adminLoggedIn, adminController.getTopCategories)

router.get('/downloadExcel',auth.adminLoggedIn, adminController.downloadExcelHandler);
router.get('/downloadPdf',auth.adminLoggedIn, adminController.downloadPdfHandler)

router.get("/customers",auth.adminLoggedIn, customerController.getCustomer);

router.get("/userBlock/:id",auth.adminLoggedIn, customerController.userBlock);

router.get("/category",auth.adminLoggedIn, categoryCotroller.getCategory);
router.post("/category", upload.array("images", 3),categoryCotroller.addCategory);

router.get("/editCategory/:id",auth.adminLoggedIn, categoryCotroller.getEditCategory);
router.patch("/editCategory/:id", categoryCotroller.patchEditCategory);

router.delete("/deleteCategory/:id", categoryCotroller.deleteCategory);

router.get("/products",auth.adminLoggedIn, productController.getProduct);

router.get("/addProducts",auth.adminLoggedIn, productController.getAddProducts);
router.post("/addProducts", upload.array("images", 3),productController.postAddProducts);

router.get("/editProduct/:id",auth.adminLoggedIn, productController.getEditProduct);
router.patch("/editProduct/:id",upload.array("images", 3),productController.patchEditProduct);

router.delete("/deleteProduct/:id", productController.deleteProduct);
router.delete('/deleteImage/:id/:imageName', productController.deleteImage);

router.get("/orders",auth.adminLoggedIn,orderController.getOrder)
router.post('/update-order-stage/:id',orderController.postUpdateStage)

router.patch("/cancel-order/:id",orderController.cancelOrder)
router.get('/view-orderdetails/:id',auth.adminLoggedIn, orderController.getOrderDetails)


router.get('/coupons',auth.adminLoggedIn,couponController.getCoupon)

router.get('/addCoupons',auth.adminLoggedIn, couponController.getAddCoupons)
router.post('/addCoupons',auth.adminLoggedIn, couponController.postAddCoupons)

router.delete('/deleteCoupon/:id',couponController.deleteCoupon)

router.get('/offers',auth.adminLoggedIn, offerController.getOffer)
router.get('/addOffers',auth.adminLoggedIn, offerController.getAddOffers)

router.post('/addOffers',auth.adminLoggedIn, offerController.postAddOffers)
router.get('/getOfferItems',auth.adminLoggedIn, offerController.getOfferItems);
// router.post('/admin',adminController.postAdminLogin)
// router.get('/dashboard',adminController.getDashboard)

module.exports = router;
