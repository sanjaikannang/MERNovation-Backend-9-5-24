import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Check if the required environment variables are set
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay key ID and key secret are required');
}

// Initialize Razorpay instance with your key credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to capture payment using Razorpay
const capturePayment = async (paymentDetails, signature) => {
    try {
        // Verify the Razorpay signature to ensure the request is genuine
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(paymentDetails.order_id + '|' + paymentDetails.razorpay_payment_id)
            .digest('hex');
        if (expectedSignature !== signature) {
            throw new Error('Invalid Razorpay signature');
        }

        // Capture the payment using Razorpay API
        const response = await razorpay.payments.capture(paymentDetails.razorpay_payment_id, paymentDetails.amount);

        return response;
    } catch (error) {
        console.error('Error capturing payment:', error.message);
        throw error;
    }
};

export default capturePayment;
