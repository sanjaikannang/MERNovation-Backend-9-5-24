import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    startingPrice: {
        type: Number,
        required: true
    },

    startingDate: {
        type: Date,
        required: true
    },

    endingDate: {
        type: Date,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    images: [{
        type: String,
        required: true
    }],

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'verified'],
        default: 'pending'
    },

    rejectionReason: String,
    verifiedBy: String, // Admin who verified the product

    quality: {
        type: String,
        default: 'Not-Verified'
    },

    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    bids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid'
    }]

});

const Product = model('Product', productSchema);

export default Product;
