const User = require("../../model/userModel");
const Product = require("../../model/productModel");
const Wishlist = require("../../model/wishlistModel");
const Cart= require("../../model/cartModel");


const loadWishlist =async(req,res) =>{

  
    try{
   
        const userId = req.session.user_id;
        const userWishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
        console.log(userWishlist);
        const userData = await User.findById(userId);
       
        if (userWishlist) {
            const wishlistItems = userWishlist.items;
            res.render('users/wishlist', { wishlistItems,userData, userId});
        } else {
            res.render('users/wishlist', { wishlistItems: [],userData, userId}); // Render with empty wishlist items
        }

    }catch(error){
      console.log(error.message);
    }
  };


  
  const addtowishlist = async (req, res) => {
    console.log("entered wishlist");
    try {
        const product_Id = req.body.productData_id;
        // Validate productId if needed
        console.log(product_Id, "asd");
        // Assuming you have a User model and Wishlist model
        const userId = req.session.user_id;

        // Check if the user has a wishlist
        let userWishlist = await Wishlist.findOne({ user: userId });

        if (!userWishlist) {
            // If the user does not have a wishlist, create a new one
            userWishlist = new Wishlist({
                user: userId,
                items: [{ product: product_Id }]
            });
            await userWishlist.save();
            return res.json({ success: true });
        } else {
            // Check if the product is already in the wishlist
            const existingProduct = userWishlist.items.find(item => item.product.toString() === product_Id);
            if (existingProduct) {
                return res.status(400).json({ success: false, message: 'Product is already in the wishlist' });
            } else {
                // Add the product to the wishlist
                userWishlist.items.push({ product: product_Id });
                await userWishlist.save();
                return res.json({ success: true });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to add product to wishlist' });
    }
};



  const wishlistToCart =async(req,res) =>{

    try {
        const userId = req.session.user_id;
        const product_Id = req.body.product_Id;
        console.log(product_Id,"product_Id");
        const { qty } = req.body;
    
        const existingCart = await Cart.findOne({ user: userId });
        console.log(existingCart,"existingCart");
    
        const productToUpdate = await Product.findById(product_Id);
    
    
        if (productToUpdate) {
         
          if (productToUpdate.stock >= parseInt(qty)) {
            if (existingCart) {
              const existingCartItem = existingCart.items.find(
                (item) => item.product._id.toString() === product_Id
              );
    
              if (existingCartItem) {
                existingCartItem.quantity += parseInt(qty);
              } else {
                existingCart.items.push({
                  product: product_Id,
                  quantity: parseInt(qty),
                });
              }
              existingCart.total = existingCart.items.reduce(
                (total, item) => total + (item.quantity || 0),
                0
              );
    
              await existingCart.save();
              //  res.render("users/cart",{  userData: userData,cart: null, message: 'Cart updated successfully' });
            } else {
              const newCart = new Cart({
                user: userId,
                items: [{ product: product_Id, quantity: parseInt(qty) }],
                total: parseInt(qty, 10),
              });
              await newCart.save();
              // return res.status(200).json({ success: true, message: 'New cart created successfully' });
            }
          } else {
            return res.status(400).json({ success: false, message: 'Out of stock or invalid quantity' });
          }
        } else {
          return res.status(400).json({ success: false, message: 'Product not found' });
        }
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error("Error adding product to cart:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
  }


  

const removeFromWishlist = async (req, res) => {
    console.log("Removing product from wishlist");
    try {
        const product_Id = req.body.productData_id;
        const userId = req.session.user_id;
       
        // Find the user's wishlist
        const userWishlist = await Wishlist.findOne({ user: userId });

        if (!userWishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found for the user' });
        }

        // Remove the product from the wishlist items array
        userWishlist.items = userWishlist.items.filter(item => item.product.toString() !== product_Id);

        // Save the updated wishlist
        await userWishlist.save();

        return res.json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to remove product from wishlist' });
    }
};


  
  
module.exports = {
    loadWishlist,
    addtowishlist,
    wishlistToCart,
    removeFromWishlist
}