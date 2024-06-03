import express from 'express';
import { createOrder, verifyPayment, getOrderDetails } from '../Controllers/paymentController.js';
import { verifyToken } from '../Middlewares/auth.js';

const router = express.Router();

// Create Order Route
router.post('/create-order', verifyToken, createOrder);

// Verify Payment Route
router.post('/verify-payment', verifyToken, verifyPayment);

// Route to get order details by order ID
router.get('/order/:orderId', verifyToken, getOrderDetails);


export default router;
