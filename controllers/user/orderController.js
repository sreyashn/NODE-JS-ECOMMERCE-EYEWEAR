const Address = require("../../model/addressModel");
const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");
const {calculateProductTotal,calculateSubtotal}=require("../../config.js/cartSum")



const loadCheckout = async (req, res) => {
    try {
      const userId = req.session.user_id;
  
      const userData = await User.findById(userId);
  
      const cart = await Cart.findOne({ user: userId })
        .populate({
          path: "items.product",
          model: "Product",
        })
        .exec();
 

  if (!cart) {
    console.log("Cart not found.");
  }
  const cartItems = cart.items || [];
  const subtotal = calculateSubtotal(cartItems);
  const productTotal = calculateProductTotal(cartItems);
  const subtotalWithShipping = subtotal ;
      const addressData = await Address.find({ user: userId });

   
  
      res.render("users/checkout",{userData,addressData,cart:cartItems,productTotal,subtotalWithShipping});
    } catch (err) {
      console.error("Error fetching user data and addresses:", err);
    }
  };

  const checkOutpost = async (req, res) => {
    try {
      const userId = req.session.user_id;

   
      const { address, paymentMethod } = req.body;

      const user = await User.findById(userId);
  
     
      const cart = await Cart.findOne({ user: userId })
        .populate({
          path: "items.product",
          model: "Product",
        })
        .populate("user");
  
        if (!user || !cart) {
          return res
            .status(500)
            .json({ success: false, error: "User or cart not found." });
        }
  
      if (!address) {
        return res.status(400).json({ error: 'Billing address not selected' });
      }
  
      const cartItems = cart.items || [];

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + (item.product.discount_price * item.quantity || 0),
    0
  );
    
  
      const order = new Order({
        user: userId,
        address: address,
        orderDate: new Date(),
        status: "Pending",
        paymentMethod: paymentMethod,
        paymentStatus: "Pending",
        deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
        totalAmount: totalAmount,
        items: cartItems.map((cartItem) => ({
          product: cartItem.product._id,
          quantity: cartItem.quantity,
          price: cartItem.product.discount_price,
        })),
      });
  
      await order.save();
  
      
  
      // Clear the user's cart after the order is placed
      cart.items = []; // Clearing items
      cart.totalAmount = 0; // Resetting totalAmount
  
      await cart.save(); // Save the updated cart
  
      res.status(200).json({ success: true, message: 'Order placed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  const loadOrderDetails=async(req,res)=>{
    try {
      const userId =  req.session.user_id;

      const userData = await User.findById(userId);
      const order = await Order.find({ user: userData._id })
      .populate('user')
      .populate({
        path: 'items.product',
        model: 'Product',
      })

      

if (userData) {
 
    res.render("users/order",{ userData,order });
  } else {
    res.redirect('/login');
  }

} catch (error) {
console.log(error.message);
}
}

const loadOrderHistory = async (req, res) => {
    try {
      const userId =  req.session.user_id;
      const orderId = req.params.id;
      const userData = await User.findById(userId);
      const order = await Order.findById(orderId)
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "Product",
        })
        
        
      res.render("users/orderDetails", {userData, order });
    } catch (error) {
      console.log(error.message);
    }
  };


  const orderCancel = async (req, res) => {
    try {
      const orderId = req.query.id;
      const userId =  req.session.user_id;
      const userData = await User.findById(userId);
   
      
      const order = await Order.findOne({ _id: orderId })
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "Product",
        });
 
        for (const item of order.items) {
          const productId = item.product._id;
          const quantity = item.quantity;
        }
  
      const updateData = await Order.findByIdAndUpdate(
        { _id: orderId },
        {
          $set: {
            status:"Cancelled"
       
          },
        }
      );

      res.redirect('/orderSuccess');
   
  
    } catch (error) {
      console.log(error.message);
    }
  };


  module.exports={
    loadCheckout,
    checkOutpost,
    loadOrderDetails,
    loadOrderHistory,
    orderCancel
  }
