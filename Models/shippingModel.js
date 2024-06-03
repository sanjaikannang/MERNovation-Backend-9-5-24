import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  stage: {
    type: String,
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  }, 

});

const Shipping = mongoose.model('Shipping', shippingSchema);

export default Shipping;
