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

router.get("/dashboard", adminController.getDashboard);

router.get("/customers", customerController.getCustomer);

router.get("/userBlock/:id", customerController.userBlock);

router.get("/category", categoryCotroller.getCategory);
router.post("/category", upload.array("images", 3),categoryCotroller.addCategory);

router.get("/editCategory/:id", categoryCotroller.getEditCategory);
router.patch("/editCategory/:id", categoryCotroller.patchEditCategory);

router.delete("/deleteCategory/:id", categoryCotroller.deleteCategory);

router.get("/products", productController.getProduct);

router.get("/addProducts", productController.getAddProducts);
router.post("/addProducts", upload.array("images", 3),productController.postAddProducts);

router.get("/editProduct/:id", productController.getEditProduct);
router.patch("/editProduct/:id",upload.array("images", 3),productController.patchEditProduct);

router.delete("/deleteProduct/:id", productController.deleteProduct);
router.delete('/deleteImage/:id/:imageName', productController.deleteImage);

router.get("/orders",orderController.getOrder)
router.post('/update-order-stage/:id',orderController.postUpdateStage)

router.get('/coupons',couponController.getCoupon)

router.get('/addCoupons',couponController.getAddCoupons)
router.post('/addCoupons',couponController.postAddCoupons)

router.delete('/deleteCoupon/:id',couponController.deleteCoupon)

router.get('/offers',offerController.getOffer)
router.get('/addOffers',offerController.getAddOffers)

router.post('/addOffers',offerController.postAddOffers)
// router.post('/admin',adminController.postAdminLogin)
// router.get('/dashboard',adminController.getDashboard)

module.exports = router;
