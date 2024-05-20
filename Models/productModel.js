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

    bidStartTime: {
        type: Date,
        required: true
    },

    bidEndTime: {
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
    verifiedBy: String,
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
    }],

    highestBid: {
        bidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        amount: Number,
        bidTime: Date
    },

    bidProcessed: {
        type: Boolean,
        default: false
    },

    biddingStatus: {
        type: String,
        enum: ['Active', 'Bidding Ended'],
        default: 'Active'
    }
    
});

const Product = mongoose.model('Product', productSchema);

export default Product;
