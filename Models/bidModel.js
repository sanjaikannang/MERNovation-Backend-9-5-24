import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const bidSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
    
});

const Bid = model('Bid', bidSchema);

export default Bid;
