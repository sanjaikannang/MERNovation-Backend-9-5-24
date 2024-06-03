import Razorpay from '../Utils/razorpay.js';
import crypto from 'crypto';
import Order from '../Models/orderModel.js';
import Product from '../Models/productModel.js';
import { v4 as uuidv4 } from 'uuid';


// Function to create a new order
export const createOrder = async (req, res) => {
  const { amount, currency, productId } = req.body; // Destructure request body to get amount, currency, and productId
  const receiptId = uuidv4(); // Generate a unique receipt ID

  try {
    // Find the product
    const product = await Product.findById(productId).populate('farmer');

    // If the product does not exist, return a 404 error
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user is a buyer
    if (req.user.role !== 'Buyer') {
      return res.status(403).json({ message: 'Only buyers can create orders' });
    }

    // Check if the current user is not the farmer who uploaded the product
    if (product.farmer._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot create an order for your own product' });
    }

    // Create order options for Razorpay
    const options = {
      amount: amount * 100, // Convert amount to the smallest currency unit
      currency,
      receipt: receiptId
    };

    // Create order with Razorpay
    const order = await Razorpay.orders.create(options);

    // Create a new order document
    const newOrder = new Order({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      product: productId,
      farmer: product.farmer._id,
      buyer: req.user._id // The buyer is the current user
    });

    // Save the new order to the database
    await newOrder.save();

    // Respond with the order details
    res.status(200).json(order);
  } catch (error) {
    // Log and respond with a server error
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Function to verify payment
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body; // Destructure request body to get payment details

  // Create the expected signature using Razorpay secret
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  // Check if the generated signature matches the received signature
  if (expectedSignature === razorpay_signature) {
    try {
      // Find the order by Razorpay order ID and populate buyer and product information
      const order = await Order.findOne({ orderId: razorpay_order_id }).populate('buyer').populate('product');

      // If the order does not exist, return a 404 error
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check if the current user is the buyer associated with the order
      if (order.buyer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to verify payment for this order' });
      }

      // Check if the order status is already 'Paid'
      if (order.status === 'Paid') {
        return res.status(400).json({ message: 'Payment has already been verified for this order' });
      }

      // Update the order status to 'Paid' and set the payment ID
      order.status = 'Paid';
      order.paymentId = razorpay_payment_id;

      // Save the updated order to the database
      await order.save();

      // Respond with a success message and the order details
      res.status(200).json({ message: 'Payment verified successfully', order });
    } catch (error) {
      // Log and respond with a server error
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    // Respond with an invalid signature error
    res.status(400).json({ message: 'Invalid signature' });
  }
};



// Function to get order details
export const getOrderDetails = async (req, res) => {
  const { orderId } = req.params;

  try {
    // console.log(`Fetching details for order ID: ${orderId}`);
    // Find the order by orderId and populate related fields
    const order = await Order.findOne({ orderId }).populate('product farmer buyer');

    if (!order) {
      // console.log('Order not found');
      return res.status(404).json({ message: 'Order not found' });
    }

    // console.log('Order found:', order);
    res.status(200).json(order);
  } catch (error) {
    // console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


