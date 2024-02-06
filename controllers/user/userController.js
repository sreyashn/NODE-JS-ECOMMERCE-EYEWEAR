const User = require("../../model/userModel");
const bcrypt = require("bcrypt");
const Category = require("../../model/categoryModel")
const Product = require("../../model/productModel")
const message = require("../../config/mailer")
const Wallet=require("../../model/walletModel")


let newUser;
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister =async(req,res) =>{
  try{
    referral = req.query.referralCode;
    console.log(referral,"referral");
    res.render("users/registration",referral);
  }catch(error){
    console.log(error.message);
  }
};

// post register

const insertUser = async (req,res) => {
  try {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const name = req.body.name;
    const password = req.body.password;
    
    if(!email||!mobile||!name || !password) {
      return res.render("users/registration",{
        message:"Please fill all the fields",
      });
    }

    req.session.referralCode = req.body.referralCode || null;
    const referralCode = req.session.referralCode;
    console.log(referralCode,"referralCode");
    const existMail = await User.findOne({email:email});

    if (referralCode) {
      referrer = await User.findOne({ referralCode:referralCode });
      console.log(referrer,"referrer");

      if (!referrer) {
        res.render("users/registration", { message: "Invalid referral code." });
      }

      if (referrer.userReferred.includes(req.body.email)) {
        res.render("users/registration", {
          message: "Referral code has already been used by this email.",
        });
      }else{
        referrer = await User.findOne({ referralCode:referralCode });
        console.log("............",referrer);
        referrerId = referrer._id

        referrerWallet = await Wallet.findOne({user:referrerId})
        console.log("////////////",referrerWallet);
        if (!referrerWallet) {
          // If wallet doesn't exist, create a new one
          referrerWallet = new Wallet({
            user: referrer._id,
            transaction: [{ type: "credit", amount: 50 }],
            walletBalance: 50, // Initial balance of 50 rupees
          });
        } else {
          // If wallet exists, update the balance
          referrerWallet.walletBalance += 50; // Add 50 rupees
          referrerWallet.transaction.push({
            type: "credit",
            amount: 50,
          });
        }
        
        await referrerWallet.save();
      }
    }

    if(existMail){
      res.render("users/registration",{ message : "this user already exists"});
    } else {
      req.session.userData = req.body;
      console.log("////....",req.session.userData);
      req.session.register = 1;
      req.session.email = email;
      if(req.session.email) {
        const data = await message.sendVarifyMail(req,req.session.email);
        res.redirect("/otp");
      }
    }
  } catch (error) {
    console.log(error.message);
  }

};


// get otp page
const loadOtp = async (req, res) => {
  try {
    res.render("users/otp");
  } catch (error) {
    console.log(error.message);
  }
};

// VERIFYOTP
const verifyOtp = async (req, res) => {
  try {
    const userData = req.session.userData;
    const fullOTP = req.body.otp;

    if (!req.session.user_id) {
      if (fullOTP == req.session.otp) {
        const secure_password = await securePassword(userData.password);
        const user = new User({
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          password: secure_password,
          image: "",
          isAdmin: 0,
          is_blocked: 0,
        });

        const userDataSave = await user.save();
        if (userDataSave && userDataSave.isAdmin === 0) {
          req.session.user_id = userDataSave._id;
          if(userData.referralCode){
            referrer = await User.findOne({ referralCode:userData.referralCode });
            referrer.userReferred = req.session.user_id
            await referrer.save()

            referrerWallet = new Wallet({
              user: req.session.user_id,
              transaction: [{ type: "credit", amount: 50 }],
              walletBalance: 50, // Initial balance of 50 rupees
            });

            await referrerWallet.save()
        }
          res.redirect("/login");
        } else {
          res.render("users/otp", { errorMessage: "Registration Failed" });
        }
      } else {
        res.render("users/otp", { errorMessage: "wrong otp" });
      }
    } else {
      if (fullOTP == req.session.otp) {
        res.redirect("/resetPassword");
      } else {
        res.render("users/otp", { errorMessage: "wrong otp" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

// resend otp
const resendOtp = async (req, res) => {
  try {
    const userData = req.session.userData;
    const email = userData.email;
    await message.sendVarifyMail(req, email);
    res.render("users/otp");
  } catch (error) {
    console.log(error.message);
  }
};



 // login user method
 const loginLoad = async (req, res) => {
   try {
   
    res.render("users/login");
  } catch (error) {
    console.log(error.message);
  }
 };

 const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("users/login", {
        message: "Please fill all the fields ",
      });
    }

    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch && userData.isAdmin === 0 && userData.is_blocked == 0) {
        req.session.user_id = userData._id;
        res.redirect("/");
      } else if (passwordMatch && userData.isAdmin === 0 && userData.is_blocked == 1) {
        res.render("users/login", {
          error: "The user is blocked",
        });
      } else {
        res.render("users/login", {
          message: "Email and password are incorrect",
        });
      }
    } else {
      res.render("users/login", {
        message: "Email and password are incorrect",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};


// forgot password
const loadForgotpassword = async (req,res) => {
  try {
    res.render("users/forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

 const forgotPasswordotp = async (req,res) =>{
   try {
     const emaildata = req.body.email;
     console.log("Email received:",emaildata);

     const userExist = await User.findOne({email: emaildata});
     req.session.userData=userExist;
     req.session.user_id = userExist._id;
     if(userExist) {
       const data = await message.sendVarifyMail(req,userExist.email);
       return res.redirect("/otp");
     } else {

      res.render("users/forgotPassword",{
        error: "Attempt Failed",
         User: null,
       });
     }
   }  catch (error) {
     console.log("Error:", error.message);
   }
    }

const loadResetPassword = async (req,res) => {
  try {
    if (req.session.user_id) {
      const userId = req.session.user_id;
      const user = await User.findById(userId);

      res.render("users/resetPassword",{ user: user });
      
    } else {
       res.redirect("/forgotPassword");
    }
  } catch (error) {
     console.log(error.message);
  }

 };

 const resetPassword =async (req,res) =>{
   try {
     const user_id = req.session.user_id;
     const password = req.body.password;
     const secure_password = await securePassword(password);
     const updateData = await  User.findByIdAndUpdate(
       { _id: user_id},
       { $set: { password: secure_password} }
     );
      res.redirect("/");
     
   } catch (error) {
     console.log(error.message);
   }
 };


 
const loadWallets = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);

    if (!userData) {
      return res.render("users/login", { userData: null });
    }
    const page = parseInt(req.query.page) || 1;
 
    const limit = 6;
    const totalCount = await Product.countDocuments();
    
    const totalPages = Math.ceil(totalCount / limit);

    const walletData = await Wallet.findOne({ user: userId }).sort({ date: -1 })
      .populate({
        path: 'transaction',
      }).skip((page - 1) * limit)
      .limit(limit);;

    if (!walletData) {
      return res.render("users/wallet", { userData, wallet: null,currentPage: 0 ,totalPages:0 });
    }

    res.render("users/wallet", { userData, wallet: walletData, totalPages ,
      currentPage: page, });

  } catch (err) {
    console.error("Error in loadWallets route:", err);
    res.status(500).send("Internal Server Error");
  }
};

const loadHome = async (req,res) =>{
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
    const productData = await Product.find();
    const categories = await Category.find();
    const banner = await Banner.find();
    console.log(banner);

    if(userData) {
     
      res.render("users/home",{userData, products: productData, categories,banner: banner || [],});
    } else {
      res.render("users/home",{ userData: null,products: productData, categories,banner: [],});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadAbout = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
  
    if (userData) {
      res.render("users/about", {  userData,  });
    } else {
      res.render("users/about", { userData: null,  });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadContact = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const userData = await User.findById(userId);
  
    if (userData) {
      res.render("users/contact", {  userData,  });
    } else {
      res.render("users/contact", { userData: null,  });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadShop = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);

    const categories = await Category.find();
    const page = parseInt(req.query.page) || 1;

    
    const limit = 6;
    const totalCount = await Product.countDocuments();

    const totalPages = Math.ceil(totalCount / limit);
    const productData = await Product.find().skip((page - 1) * limit).limit(limit);

    res.render("users/shop", { products: productData, userData, categories,totalPages, currentPage: page,});
  } catch (error) {
    console.log(error.message);
  }
};

const loadShopCategory = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    const categoryId = req.query.id;
    const page = parseInt(req.query.page) || 1;
 
    const limit = 6;
    const totalCount = await Product.countDocuments({category:categoryId});
    
    const totalPages = Math.ceil(totalCount / limit);
    const productData = await Product.find({category:categoryId}).skip((page - 1) * limit)
    .limit(limit);
    const categories = await Category.find();
    res.render("users/shop", { products: productData, userData, categories,totalPages,currentPage: page,  });

  } catch (error) {
    console.log(error.message);
  }
};

const loadSingleShop = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);

    if (!userData) {
      return res.status(404).send("User not found");
    }

    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    const categories = await Category.find();

    if (!categories || categories.length === 0) {
      return res.status(404).send("Categories not found");
    }


    res.render("users/singleProduct", { userData, product, categories });
  } catch (error) {
    console.log(error.message);
  }
};

const loadprofile = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const userData = await User.findById(userId);
    if (userData) {
      res.render("users/userProfile", { userData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const userEdit = async (req, res) => {
  try {
    let id = req.body.user_id;

    const userData = await User.findById(id);

    const { name, mobile } = req.body;

    if(!req.file){
      const updateData = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            mobile,
       
          },
        }
      );
    }
    else{
      const updateData = await User.findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            name,
            mobile,
            image: req.file.filename,
          },
        }
      );
    }


    res.redirect("/userprofile");
  } catch (error) {
    console.log(error.message);
  }
};    








const updateUserProfilepic = async (req, res) => {
  try {
    const userData = await User.findById(req.session.user_id);

    if (!req.file) {
      // Handle error if no file is received
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const croppedImage = req.file.filename;

    await User.findByIdAndUpdate(userData._id, {
      $set: {
        image: croppedImage,
      },
    });

    res.status(200).json({ success: true, message: 'Profile Picture changed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




const userLogout = async (req,res) => {
  try {
    req.session.user_id =null
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
}


module.exports = {
  loadRegister,
   insertUser,
   loginLoad,
   verifyLogin,
   loadForgotpassword,
   forgotPasswordotp,
   loadWallets,
   loadHome,
   userLogout,
   loadResetPassword,
   resetPassword,
   loadAbout,
   loadContact,
   loadShop,
   loadShopCategory,
   loadSingleShop,
   loadprofile,
   userEdit,
   loadOtp,
   verifyOtp,
   resendOtp,
   updateUserProfilepic
};

