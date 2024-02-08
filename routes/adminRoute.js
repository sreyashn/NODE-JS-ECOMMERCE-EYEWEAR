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
admin_route.post("/addproduct",adminAuth.isLogin, multer.uploadProduct.array('image'),productController.addProduct);
admin_route.get("/editproduct",adminAuth.isLogin, productController.loadEditproduct);
admin_route.post("/editproduct",adminAuth.isLogin, multer.uploadProduct.array('image'),productController.editProduct);
admin_route.get("/deleteproduct",adminAuth.isLogin,productController.deleteProduct);

//orders
admin_route.get("/alluserorders",adminAuth.isLogin, orderController.listUserOrders);
admin_route.get("/orderDetails",adminAuth.isLogin,orderController.listOrderDetails);
admin_route.put("/orderStatusChange",adminAuth.isLogin,orderController.orderStatusChange);
admin_route.get("/salesReport",adminAuth.isLogin,orderController.loadSalesReport);
  

//coupon
admin_route.get("/couponAdd",adminAuth.isLogin, couponController.loadCouponAdd);
admin_route.post("/couponAdd",adminAuth.isLogin, couponController.addCoupon);
admin_route.get("/couponList",adminAuth.isLogin,couponController.loadCouponList);
admin_route.get("/couponEdit",adminAuth.isLogin,couponController.loadEditCoupon);
admin_route.put("/couponEdit",adminAuth.isLogin,  couponController.editCoupon);
admin_route.get("/couponUnlist",adminAuth.isLogin,couponController.unlistCoupon);
admin_route.get("/couponDetails",adminAuth.isLogin,couponController.couponDetails);

//offer
admin_route.get("/offerAdd",adminAuth.isLogin, offerController.loadOfferAdd);
admin_route.post("/offerAdd",adminAuth.isLogin, offerController.addOffer);
admin_route.get("/offerlist",adminAuth.isLogin, offerController.OfferList);
admin_route.get("/offerEdit",adminAuth.isLogin, offerController.loadOfferEdit);
admin_route.put("/offerEdit",adminAuth.isLogin, offerController.editOffer);
admin_route.get("/blockOffer",adminAuth.isLogin, offerController.offerBlock);


module.exports = admin_route;