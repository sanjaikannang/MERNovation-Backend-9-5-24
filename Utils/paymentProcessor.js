import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const processPayment = async (userId, productId, amount) => {
    try {
        const paymentOptions = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: 'INR',
            receipt: `${productId}-${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(paymentOptions);
        return order;
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        throw new Error('Payment processing failed');
    }
};
