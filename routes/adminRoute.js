const express = require("express");
const admin_route = express();
const adminController = require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productController");
const orderController = require("../controllers/admin/orderController");
const adminAuth = require("../middleware/adminAuth");
const multer = require("../middleware/multer");
const couponController = require("../controllers/admin/couponController");
const offerController = require("../controllers/admin/offerController");
const bannerController = require("../controllers/admin/bannerController");



// Login
admin_route.get("/",adminAuth.isLogout,adminController.loadAdminlogin);
admin_route.get("/logout",adminAuth.isLogin, adminController.adminLogout);
admin_route.post("/",adminController.verifyLogin);

//admin dashboard
admin_route.get("/dashboard", adminAuth.isLogin,adminController.loadHome);

//category
admin_route.get("/category", adminAuth.isLogin,categoryController.loadCategory);
admin_route.get("/addcategory", adminAuth.isLogin,categoryController.loadAddcategory);
admin_route.post("/addcategory",multer.uploadCategory.single("image"),categoryController.addCategory);
admin_route.get("/unlistCategory",adminAuth.isLogin,categoryController.unlistCategory);
admin_route.get("/editCategory",adminAuth.isLogin,categoryController.loadEditCategory);
admin_route.post("/editCategory",multer.uploadCategory.single('image'),categoryController.categoryEdit);

//user
admin_route.get("/userManage", adminAuth.isLogin, adminController.loadUsermanage);
admin_route.get("/blockAndunblock/:id",adminAuth.isLogin, adminController.blockAndunblockUser);

// products
admin_route.get("/products",adminAuth.isLogin,productController.loadProducts);
admin_route.get("/addproduct",adminAuth.isLogin, productController.addProductForm);
admin_route.post("/addproduct",multer.uploadProduct.array('image'),productController.addProduct);
admin_route.get("/editproduct",adminAuth.isLogin, productController.loadEditproduct);
admin_route.post("/editproduct",multer.uploadProduct.array('image'),productController.editProduct);
admin_route.get("/deleteproduct",adminAuth.isLogin,productController.deleteProduct);

//orders
admin_route.get("/alluserorders",adminAuth.isLogin, orderController.listUserOrders);
admin_route.get("/orderDetails",adminAuth.isLogin,orderController.listOrderDetails);
admin_route.put("/orderStatusChange",adminAuth.isLogin,orderController.orderStatusChange);
admin_route.get("/salesReport",adminAuth.isLogin,orderController.loadSalesReport);
  

//coupon
admin_route.get("/couponAdd",adminAuth.isLogin, couponController.loadCouponAdd);
admin_route.post("/couponAdd", couponController.addCoupon);
admin_route.get("/couponList",adminAuth.isLogin,couponController.loadCouponList);
admin_route.get("/couponEdit",adminAuth.isLogin,couponController.loadEditCoupon);
admin_route.put("/couponEdit", couponController.editCoupon);
admin_route.get("/couponUnlist",adminAuth.isLogin,couponController.unlistCoupon);
admin_route.get("/couponDetails",adminAuth.isLogin,couponController.couponDetails);

//offer
admin_route.get("/offerAdd",offerController.loadOfferAdd);
admin_route.post("/offerAdd",offerController.addOffer);
admin_route.get("/offerlist",offerController.OfferList);
admin_route.get("/offerEdit",offerController.loadOfferEdit);
admin_route.put("/offerEdit",offerController.editOffer);
admin_route.get("/blockOffer",offerController.offerBlock);

//banner
admin_route.get("/banner",bannerController.loadBanner);
admin_route.get("/addbanner",bannerController.loadAddBanner);
admin_route.post("/addbanner",bannerController.addBanner);




module.exports = admin_route;