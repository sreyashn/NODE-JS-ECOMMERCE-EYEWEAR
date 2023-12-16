// const User =require("../model/userModel");

// const  isLogin = async(req,res,next)=>{

//     try{
//         if (req.session.user_id) {

//         const userData = await User.findOne({_id:req.session.user_id });
        
//         if(userData && userData.is_admin==0){
//          next();

//         }else{
//             res.redirect('/');
//         }
//     }

//     }catch(error){
//         console.log(error.message);
//     }
// }



// const isLogout =async(req,res,next)=>{
//     try{
//         if (req.session.user_id) {
//             const userData = await User.findOne({_id: req.session.user_id});

//             // Check if user is not an admin
//             if (userData && userData.is_admin === 0) {
//                 res.redirect('/');
//             } else {
//                 // User is either an admin or not found, proceed to the next middleware
//                 next();
//             }
//         } else {
//             // User is not logged in, proceed to the next middleware
//             next();
//         }
       
//     }catch(error){
//         console.log(error.message);
//     }
// }

// module.exports ={
//     isLogin,
//     isLogout
// }


const User = require("../model/userModel");

const isLogin=async(req,res,next)=>{
    try {
    
      const userData = await User.findOne({ _id: req.session.user_id });
  if (req.session.user_id && userData.isAdmin==0 && userData.is_blocked===1 ) {

    next()
  } else {
 
    res.redirect('/')
  
  }


    } catch(error){
  console.log(error.message);
    }
}


const isLogout=async(req,res,next)=>{
    try {
     
      const userData = await User.findOne({ _id: req.session.user_id });
        if (req.session.user_id && userData.isAdmin==0  ) {
  
            res.redirect('/')

        } else{
       
          next()
        }
      

    } catch(error){
  console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout,
    
}