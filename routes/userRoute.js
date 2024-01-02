const express = require("express");
const user_route = express();
const auth = require("../middleware/auth");
const userController = require("../controllers/user/userController");
const cartController = require("../controllers/user/cartController");
const orderController = require("../controllers/user/orderController");
const addressController=require("../controllers/user/addressController");
const multer = require("../middleware/multer");


//register
user_route.get("/register",auth.isLogout,userController.loadRegister);
user_route.post("/register", userController.insertUser);

 user_route.get("/otp", userController.loadOtp);
 user_route.post("/otp", userController.verifyOtp);
 user_route.get("/resendotp", userController.resendOtp);

 
 //user login
 user_route.get("/login", auth.isLogout,userController.loginLoad);
 user_route.post("/login", userController.verifyLogin);
 user_route.get("/forgotPassword",auth.isLogout,userController.loadForgotpassword);
 user_route.post("/forgotPassword",userController.forgotPasswordotp);
 user_route.get("/resetPassword",userController.loadResetPassword);
 user_route.post("/resetPassword",userController.resetPassword);

 //home

 user_route.get("/", userController.loadHome);
 user_route.get("/shop", userController.loadShop);
 user_route.get("/shopCategoryFilter",userController.loadShopCategory);
 user_route.get("/singleProduct/:id",userController.loadSingleShop);
 user_route.get("/wishlist", userController.loadWishlist);

 //cart
 user_route.get("/cart",cartController.loadCartPage);
 user_route.post("/cart",cartController.addTocart );
 user_route.put("/updateCart", cartController.updateCartCount);
 user_route.delete("/removeCartitem", cartController.removeFromCart);

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
 user_route.get("/checkout",orderController.loadCheckout );
 user_route.post("/checkout",orderController.checkOutpost );
 user_route.get("/orderSuccess",orderController.loadOrderDetails);
 user_route.get("/orderDetails/:id",orderController.loadOrderHistory);
 user_route.get("/orderCancel",orderController.orderCancel);


user_route.get("/logout",userController.userLogout);


module.exports = user_route;