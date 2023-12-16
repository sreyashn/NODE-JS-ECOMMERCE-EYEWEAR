const express = require("express");
const user_route = express();
const auth = require("../middleware/auth");
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");


//register
user_route.get("/register",auth.isLogout,userController.loadRegister);
user_route.post("/register", userController.insertUser);

 user_route.get("/otp", userController.loadOtp);
 user_route.post("/otp", userController.verifyOtp);
 user_route.get("/resendotp", userController.resendOtp);

 
 //user
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


user_route.get("/logout",userController.userLogout);


module.exports = user_route;