const Address = require("../../model/addressModel");
const User = require("../../model/userModel");
const Cart = require("../../model/cartModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModel");
const Wallet=require("../../model/walletModel")
const Coupon = require("../../model//couponModel");
const {calculateDiscountedTotal,calculateProductTotal,calculateSubtotal}=require("../../config.js/cartSum")
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: 'rzp_test_rwud39pugiL6zo',
  key_secret: 'JLkOG8uWsGrEd7GthYgW475S',
}); 

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
  const currentDate = new Date();
  const subtotal = calculateSubtotal(cartItems);
  const productTotal = calculateProductTotal(cartItems);
  const subtotalWithShipping = subtotal ;
  const addressData = await Address.find({ user: userId });


  const coupon = await Coupon.find({
    expiry: { $gt: currentDate },
    is_listed: true,
  }).sort({ createdDate: -1 });
  res.render("users/checkout",{userData,addressData,cart:cartItems,cartData:cart,productTotal,subtotalWithShipping,coupon});
    } catch (err) {
      console.error("Error fetching user data and addresses:", err);
    }
  };

  
const razorpayOrder = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const { address, paymentMethod,couponCode,} = req.body;

    const user = await User.findById(userId);

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      return res.status(500).json({ success: false, error: "User or cart not found." });
    }

    if (!address) {
      return res.status(400).json({ error: "Billing address not selected" });
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;
     totalAmount = cartItems.reduce(
      (acc, item) => acc + (item.product.discount_price?item.product.discount_price * item.quantity:item.product.price * item.quantity || 0),
      0
    );

    
    totalAmount = cartItems.reduce((acc, item) => {
      if (item.product.discount_price && item.product.discountStatus &&
        new Date(item.product.discountStart) <= new Date() &&
        new Date(item.product.discountEnd) >= new Date()) {
        return acc + (item.product.discount_price * item.quantity || 0);
      } else {
        return acc + (item.product.price * item.quantity || 0);
      }
    }, 0); 


    if (couponCode) {
      totalAmount = await applyCoup(couponCode, totalAmount, userId);

    }

    const options = {
      amount:  Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `order_${Date.now()}`, 
      payment_capture: 1,
    };

    instance.orders.create(options, async (err, razorpayOrder) => {
      if (err) {
        console.error("Error creating Razorpay order:", err);
        return res
          .status(400)
          .json({ success: false, error: "Payment Failed", user });
      } else {
    
        res.status(201).json({success: true,
          message: "Order placed successfully.",
          order: razorpayOrder,
        });
      }
    });

    

  } catch (error) {
    console.error("An error occurred while placing the order: ", error);
    return res.status(400).json({ success: false, error: "Payment Failed" });
  }
};





const checkOutpost = async (req, res) => {
  try {
    const userId = req.session.user_id;

 
    const { address, paymentMethod,couponCode } = req.body;

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
    for (const cartItem of cartItems) {
      const product = cartItem.product;
      
        if (product && product.stock >= cartItem.quantity) {
          product.stock -= cartItem.quantity;
    
      await product.save();
    }else {
      return res
        .status(400)
        .json({success: false, error: `${product.name} is out of stock.` });
    }


  }

  let totalAmount = cartItems.reduce((acc, item) => {
    if (item.product.discount_price && item.product.discountStatus &&
      new Date(item.product.discountStart) <= new Date() &&
      new Date(item.product.discountEnd) >= new Date()) {
      return acc + (item.product.discount_price * item.quantity || 0);
    } else {
      return acc + (item.product.price * item.quantity || 0);
    }
  }, 0);

  if (couponCode) {
    totalAmount = await applyCoup(couponCode, totalAmount, userId);
  }

  if (paymentMethod =="Wallet") {
 
    const walletData = await Wallet.findOne({ user: userId });
    
   
         if (totalAmount <= walletData.walletBalance) {
   
           
   
             walletData.walletBalance -=totalAmount;
             walletData.transaction.push({
               type: "debit",
               amount:totalAmount,
             });
           
             await walletData.save(); 
           
    
           const order = new Order({
             user: userId,
             address: address,
             orderDate: new Date(),
   
             deliveryDate: new Date(
               new Date().getTime() + 5 * 24 * 60 * 60 * 1000
             ),
             totalAmount: totalAmount,
             coupon: couponCode,
             items: cartItems.map((cartItem) => ({
               product: cartItem.product._id,
               quantity: cartItem.quantity,
               size: cartItem.size,
               price:cartItem.product.discount_price &&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discount_price :cartItem.product.price,
           
               status: "Confirmed",
               paymentMethod: paymentMethod,
               paymentStatus: "success",
             })),
           });
         
   
           await order.save();
         } else {
           return res
             .status(500)
             .json({ success: false, error: "insuficient balance." });
         }
       }

  
if (paymentMethod=="onlinePayment")  {
const order = new Order({
  user: userId,
  address: address,
  coupon: couponCode,
  orderDate: new Date(),
  deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
  totalAmount: req.body.amount,
  items: cartItems.map((cartItem) => ({
    product: cartItem.product._id,
    quantity: cartItem.quantity,
    size: cartItem.size,
    price:cartItem.product.discount_price&&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discount_price :cartItem.product.price,
    status: "Confirmed",
    paymentMethod: paymentMethod,
    paymentStatus: "success",
  })),
});

await order.save();
  
}else if (paymentMethod=="CashOnDelivery")  {
    const order = new Order({
      user: userId,
      address: address,
      orderDate: new Date(),
     
      deliveryDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
      totalAmount: totalAmount,
      coupon: couponCode,
      items: cartItems.map((cartItem) => ({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        // size: cartItem.size,  
        price:cartItem.product.discount_price &&cartItem.product.discountStatus &&new Date(cartItem.product.discountStart) <= new Date() && new Date(cartItem.product.discountEnd) >= new Date()?cartItem.product.discount_price:cartItem.product.price,
        paymentMethod: paymentMethod,
        status: "Confirmed",
        paymentStatus: "Pending",
      })),
    });
    await order.save();
  }else{

  }
    

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
  
  

      const page = parseInt(req.query.page) || 1;
      let query = {};
      const limit = 6;
      const totalCount = await Order.countDocuments({ user: userData._id });
      const totalPages = Math.ceil(totalCount / limit);
      const order = await Order.find({ user: userData._id })
      .populate('user')
      .populate({
        path: 'items.product',
        model: 'Product',
      }).sort({ orderDate: -1 } ) .skip((page - 1) * limit)
      .limit(limit);

      

if (userData) {
 
    res.render("users/order",{ userData, order, totalPages,
      currentPage: page, });
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
      const couponId = req.query.couponId;
      const coupon = await Coupon.findById(couponId)
     
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
        .populate("coupon")
        
      res.render("users/orderDetails",{userData, order,coupon});
    } catch (error) {
      console.log(error.message);
    }
  };




  const orderCancel = async (req, res) => {
    try {
      // const orderId = req.query.id;
      const {orderId, productId, status} =req.body
      const itemId = req.body.productId;
      const userId =  req.session.user_id;
      const order = await Order.findById(orderId)      
        .populate("user")
        .populate({
          path: "address",
          model: "Address",
        })
        .populate({
          path: "items.product",
          model: "Product",
        });
        console.log(order);

        let totalAmount = order.totalAmount;
      const item = order.items.find((item) => item.product._id.toString() === itemId);
      if (!item) {
          return res.status(404).json({ success: false, error: 'Item not found in the order.' });
      }
    
      const couponData = await Coupon.findOne({ code: order.coupon });

      if (item.status === "Confirmed") {
        const product = item.product;
        product.stock += item.quantity;
        await item.product.save();
      
        if (item.paymentMethod === "Wallet" || item.paymentMethod === "onlinePayment") {
        const walletData = await Wallet.findOne({ user: userId, });

        if (walletData) {
          walletData.walletBalance += (product.price * item.quantity) - (product.price * item.quantity) * (couponData?.discount ? couponData.discount : 0) / 100;
          walletData.transaction.push({
              type: "credit",
              amount: (product.price * item.quantity) - (product.price * item.quantity) * (couponData?.discount ? couponData.discount : 0) / 100,
          });
      
          await walletData.save();
      } else {
          const wallet = new Wallet({
              user: userId,
              transaction: [{ type: "credit", amount: (product.price * item.quantity) - (product.price * item.quantity) * (couponData?.discount ? couponData.discount : 0) / 100 }],
              walletBalance: (product.price * item.quantity) - (product.price * item.quantity) * (couponData?.discount ? couponData.discount : 0) / 100,
          });
      
          await wallet.save();
      }
        

        product.paymentStatus = "Refunded";
      } else {
        product.paymentStatus = "Declined";
      }
      item.status = "Cancelled";

   
      console.log(typeof product.price,"price", item.quantity,"jhjhjhj");

      order.reason = reason;
      // totalAmount =totalAmount- ((product.price * item.quantity)- (product.price * item.quantity)*(couponData?.discount?couponData.discount:0)/100);
    }
  

        // const updateData = await Order.updateOne(
        //   { _id: orderId, 'items._id': itemId },
        //   { $set: { 'items.$.status': 'Cancelled' } }
        // );

        console.log(order.items,"hjkhj",totalAmount);

        const updateData = await Order.findByIdAndUpdate(
          orderId,
          {
            $set: {
              items: order.items,
              totalAmount
            },
          },
          { new: true }
        );
    
        if (updateData) {
          console.log("Order cancelled successfully:", updateData);
          // res.redirect("/orderSuccess");
          return res.status(200).json({ success: true, message: 'Item cancelled successfully' });

      } else {
          console.log("Order not found.");
          res.status(404).send("Order not found");
      }
     
      } catch (error) {
        console.log(error.message);
      }
    };


    const returnData = async (req, res) => {
      const { status, productId, orderId } = req.body;
      console.log(status, productId, orderId);
    
      try {
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
    
        if (!order) {
          return res.status(404).json({ success: false, error: 'Order not found' });
        }
    
        // Check if the order has a coupon
        const couponData = order.coupon
          ? await Coupon.findOne({ code: order.coupon })
          : { discount: 0 }; // Set a default discount if no coupon is present
    
        const user_id = order.user._id;
        let totalAmount = order.totalAmount;
    
        const product = order.items.find(
          (item) => item.product._id.toString() === productId
        );
    
        if (product && product.product) {
    
          if (product.status === "Delivered") {
            product.product.sizes.forEach((size) => {
              if (size.size === product.size.toString()) {
                size.stock += product.quantity;
              }
            });
            await product.product.save();
          }
    
          const walletData = await Wallet.findOne({ user: user_id });
    
          if (walletData) {
            walletData.walletBalance += (product.price * product.quantity) - (product.price * product.quantity) * (couponData.discount) / 100;
    
            walletData.transaction.push({
              type: "credit",
              amount: (product.price * product.quantity) - (product.price * product.quantity) * (couponData.discount) / 100,
            });
    
            await walletData.save();
          } else {
    
            const wallet = new Wallet({
              user: user_id,
              transaction: [{ type: "credit", amount: (product.price * product.quantity) - (product.price * product.quantity) * (couponData.discount) / 100 }],
              walletBalance: (product.price * product.quantity) - (product.price * product.quantity) * (couponData.discount) / 100
            });
    
            await wallet.save();
          }
    
          product.status = "Returned";
          product.paymentStatus = "Refunded";
          product.reason = reason;
          totalAmount = totalAmount - (product.price * product.quantity) - (product.price * product.quantity) * (couponData.discount) / 100;
    
        }
    
        await order.save();
    
        res.status(200).json({ success: true, message: "return successfully" });
      } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    };
    
    
  

    
const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    console.log(couponCode);
    const userId = req.session.user_id;
    const coupon = await Coupon.findOne({ code: couponCode });

    let errorMessage;

    if (!coupon) {
      errorMessage = "Coupon not found";
      return res.json({ errorMessage });
    }

    const currentDate = new Date();

    if (coupon.expiry && currentDate > coupon.expiry) {
      errorMessage = "Coupon Expired";
      return res.json({ errorMessage });
    }


    if (coupon.usersUsed.length >= coupon.limit) {
      errorMessage = "Coupon limit Reached";
      return res.json({ errorMessage });
    }

    if (coupon.usersUsed.includes(userId)) {
      errorMessage = "You already used this coupon";
      return res.json({ errorMessage });
    }

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .exec();
      console.log(cart);

    const cartItems = cart.items || [];
    const orderTotal = calculateSubtotal(cartItems);
    console.log(orderTotal);
    if (coupon.minAmt>orderTotal) {
      errorMessage = "The amount is less than minimum  amount";
      return res.json({ errorMessage });
    }

    let discountedTotal = 0;


  
    discountedTotal = calculateDiscountedTotal(orderTotal, coupon.discount);
    if (coupon.maxAmt<discountedTotal) {
      errorMessage = "The Discount cant be applied. It is beyond maximum  amount";
      return res.json({ errorMessage });
    }
    console.log("//////////////",discountedTotal);

    res.status(200).json({ success: true,discountedTotal, message: "return sucessfully" });
    
  } catch (error) {
  
    res.status(500).json({ errorMessage: "Internal Server Error" });
  }
};

// Apply coupon Function
async function applyCoup(couponCode, discountedTotal, userId) {
  const coupon = await Coupon.findOne({ code: couponCode });
  if (!coupon) {
    return discountedTotal;
  }
  const currentDate = new Date();
  if (currentDate > coupon.expiry) {
    return discountedTotal;
  }
  if (coupon.usersUsed.length >= coupon.limit) {
    return discountedTotal;
  }

  if (coupon.usersUsed.includes(userId)) {
    return discountedTotal;
  }

    discountedTotal = calculateDiscountedTotal(
      discountedTotal,
      coupon.discount
    );
  
  coupon.limit--;
  coupon.usersUsed.push(userId);
  await coupon.save();
  return discountedTotal;
}


const removeCoupon = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const cart = await Cart.findById(userId);

    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    if (cart.coupon) {
      // Clear the coupon field in the cart
      cart.coupon = "";

      // Recalculate total amount after removing the coupon
      let totalAmount = 0;
      for (const item of cart.items) {
        totalAmount += item.price * item.quantity;
      }
      cart.totalAmount = totalAmount;

      // Save the updated cart
      await cart.save();

      return res.status(200).json({ success: true, message: 'Coupon removed successfully', cart });
    } else {
      return res.status(400).json({ success: false, error: 'No coupon applied to the cart' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};


  module.exports={
    loadCheckout,
    checkOutpost,
    loadOrderDetails,
    loadOrderHistory,
    orderCancel,
    razorpayOrder,
    returnData,
    applyCoupon,
    removeCoupon

  }
