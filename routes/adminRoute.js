const express = require("express");
const admin_route = express();
const adminController = require("../controllers/adminController");
 const categoryController = require("../controllers/categoryController");
 const productController = require("../controllers/productController");
const adminAuth = require("../middleware/adminAuth");
const multer = require("../middleware/multer");




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
admin_route.get("/deleteproduct/:id",adminAuth.isLogin,productController.deleteProduct);






module.exports = admin_route;