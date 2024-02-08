
const User = require("../model/userModel");



// const isLogin=async(req,res,next)=>{
// const userData = await User.findOne({ _id: req.session.user_id });

//     try {
    
//        if (req.session.user_id && userData.isAdmin==0 && userData.is_blocked===0 ) {

//     next();
//   }else{

//     if(userData.is_blocked==1){
//       req.session.user_id=null ;
//       res.render("login", { message: "You are blocked from this site!" });
//   } 

//   else {
 
//     res.redirect('/')
  
//   }
// }


// }catch(error){
//   console.log(error.message);
//     }

// }
const isLogin = async (req, res, next) => {
  try {
      const userData = await User.findOne({ _id: req.session.user_id });

      if (!req.session.user_id || !userData) {
          // No user found or session expired, redirect to login page
          return res.redirect('/login');
      }

      if (userData.is_blocked === 1) {
          // User is blocked, clear session and redirect to login page with a message
          req.session.user_id = null;
          return res.render("login", { message: "You are blocked from this site!" });
      }

      if (userData.isAdmin === 0) {
          // User is not an admin and not blocked, proceed to the next middleware
          next();
      } else {
          // Redirect to homepage if the user is an admin
          res.redirect('/');
      }
  } catch (error) {
      console.error("Error in isLogin middleware:", error);
      res.status(500).send("Internal server error");
  }
};


const isLogout=async(req,res,next)=>{
  const userData = await User.findOne({ _id: req.session.user_id });
    try {
     

        if (req.session.user_id && userData.isAdmin==0  ) {
  
            res.redirect('/')

        } else{
       
          next();
        }
      

    } catch(error){
  console.log(error.message);
    }
}


module.exports={
    isLogin,
    isLogout,
    
}