const bcrypt = require("bcrypt");
const User = require("../../model/userModel");


const loadAdminlogin = async (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
 
  }
};

const verifyLogin = async (req, res) => {

   try {
     const { email, password } = req.body;

     const adminData = await User.findOne({ email: email });

     if (adminData) {
       const passwordMatch = await bcrypt.compare(password, adminData.password);
       if (passwordMatch && adminData.isAdmin === 1) {
    
         req.session.admin_id = adminData._id;
         res.redirect("/admin/dashboard");
      } else {
        res.render("admin/login", {
           message: "Email and password are incorrect",
         });
      }
     } else {
       res.render("admin/login");
     }
   } catch (error) {
     console.log(error.message);
   }
 };

 const loadHome = async (req, res) => {
   try {
     const adminId = req.session.admin_id;

     const adminData = await User.findById(adminId);
 
     if (adminData) {
       res.render("admin/adminHome", { admin: adminData });
     } else {
       res.status(404).send("User not found");
     }
   } catch (error) {
     console.log(error.message);
       }
 };
 
const loadUsermanage = async(req,res)=>{
  try{
    const userData = await User.findById({ _id: req.session.admin_id });  
      const usermanageData= await User.find();
      res.render("admin/userManagement", { admin: userData, user: usermanageData });
  } catch (error) {
    console.log(error.message);
  }
}



const  blockAndunblockUser = async (req, res) => {


  try {
    const id = req.params.id;
    const Uservalue = await User.findById(id);
    
    if (Uservalue.is_blocked) {
      const UserData = await User.updateOne(
        {_id:id},
        {
          $set: {
            is_blocked: 0
          },
        }
      );
      if (req.session.user_id) delete req.session.user_id;
    }else{
    
      const UserData = await User.updateOne(
        {_id:id},
        {
          $set: {
            is_blocked: 1
          },
        }
      );
    }
    
    res.redirect("/admin/userManage");
  } catch (error) {
    console.log(error.message);
  }


};

    




const adminLogout = async (req, res) => {
  try {

  
    delete req.session.admin_id;
 
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  
  }
};

module.exports = {
  loadAdminlogin,
   verifyLogin,
   loadHome,
   loadUsermanage,
   blockAndunblockUser,
   adminLogout

  };
