import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },

  paymentId: {
    type: String
  },

  status: {
    type: String,
    enum: ['Created', 'Paid', 'Failed'],
    default: 'Created'
  },

  amount: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    required: true
  },
  receipt: {
    type: String,
    required: true
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
  
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
