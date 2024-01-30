const express = require("express");
const user_route = express();
const auth = require("../middleware/auth");
const userController = require("../controllers/user/userController");
const cartController = require("../controllers/user/cartController");
const orderController = require("../controllers/user/orderController");
const addressController=require("../controllers/user/addressController");
const couponController=require('../controllers/admin/couponController');
const wishlistController=require('../controllers/user/wishlistController');
const multer = require("../middleware/multer");


//register
user_route.get("/register",auth.isLogout,userController.loadRegister);
user_route.post("/register", userController.insertUser);

 user_route.get("/otp", userController.loadOtp);
 user_route.post("/otp", userController.verifyOtp);
 user_route.get("/resendotp", userController.resendOtp);
 user_route.get("/logout",auth.isLogin,userController.userLogout);
 user_route.get('/Wallets',auth.isLogin,userController.loadWallets);

 
 //user login
 user_route.get("/login", auth.isLogout,userController.loginLoad);
 user_route.post("/login", userController.verifyLogin);
 user_route.get("/forgotPassword",auth.isLogout,userController.loadForgotpassword);
 user_route.post("/forgotPassword",userController.forgotPasswordotp);
 user_route.get("/resetPassword",userController.loadResetPassword);
 user_route.post("/resetPassword",userController.resetPassword);

 //home

 user_route.get("/", userController.loadHome);
 user_route.get("/about", userController.loadAbout);
 user_route.get("/contact", userController.loadContact);
 user_route.get("/shop",userController.loadShop);
 user_route.get("/shopCategoryFilter",auth.isLogin,userController.loadShopCategory);
 user_route.get("/singleProduct/:id",auth.isLogin,userController.loadSingleShop);




 //cart
 user_route.get("/cart",auth.isLogin,cartController.loadCartPage);
 user_route.post("/cart",auth.isLogin,cartController.addTocart );
 user_route.put("/updateCart",auth.isLogin, cartController.updateCartCount);
 user_route.delete("/removeCartitem",auth.isLogin,cartController.removeFromCart);

 //user
 user_route.get("/userprofile",userController.loadprofile );
 user_route.post("/userprofile",multer.uploadUser.single('image'),userController.userEdit );
 user_route.get("/userAddress",addressController.loadAddress );
 user_route.get("/addAddress",addressController.loadAddAddress );
 user_route.post("/addAddress",addressController.addAddress );
 user_route.get("/editAddress",addressController.loadEditAddress );
 user_route.post("/editAddress",addressController.editAddress);
 user_route.get("/deleteAddress",addressController.deleteAddress );


 //order
 user_route.get("/checkout",auth.isLogin,orderController.loadCheckout );
 user_route.post("/checkout",auth.isLogin,orderController.checkOutpost );
 user_route.post('/razorpayOrder',orderController.razorpayOrder );
 user_route.get("/orderSuccess",auth.isLogin,orderController.loadOrderDetails);
 user_route.get("/orderDetails/:id",auth.isLogin,orderController.loadOrderHistory);
 user_route.post("/removeCoupon", auth.isLogin, orderController.removeCoupon);


//  user_route.get("/orderCancel",orderController.orderCancel);
 user_route.post("/orderCancel",orderController.orderCancel);
 user_route.post('/return',orderController.returnData );


 //coupon
user_route.get('/coupons',auth.isLogin,couponController.userCouponList)
user_route.post('/applyCoupon',orderController.applyCoupon)

//wishlist
user_route.get("/wishlist", auth.isLogin,wishlistController.loadWishlist);
user_route.post("/addtowishlist", auth.isLogin,wishlistController.addtowishlist);
user_route.delete("/removeWishlist", auth.isLogin,wishlistController.removeFromWishlist);



module.exports = user_route;