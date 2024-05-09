import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  imageUrls: [{
    type: String, 
    required: true
  }],

  startingPrice: {
    type: Number,
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  endTime: {
    type: Date,
    required: true
  },

  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
  }

});

const Product = mongoose.model('Product', productSchema);

export default Product;
