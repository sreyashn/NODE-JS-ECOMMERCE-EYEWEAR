const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  coupon:{
    type:String,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
  },
  shipping:{
    type:String,
    default:'Free Shipping'
},
  totalAmount :{
    type:Number,
    require:true,
  },
 
 
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
      price: Number,
      status: {
        type: String,
        default: 'Confirmed',
      },
      paymentMethod: {
        type:String,
        require:true,
      },
      paymentStatus:{
        type:String,
        default:'Pending'
      },
    },
  ],
});

module.exports = mongoose.model('Order', orderSchema);