import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['Admin', 'Farmer', 'Buyer'],
        default: 'Farmer',
        required: true
    },

    phoneNo: {
        type: String,
        required: true
    }

});

const User = model('User', userSchema);

export default User;
