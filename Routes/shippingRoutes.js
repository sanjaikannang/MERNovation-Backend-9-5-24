import express from 'express';
import { postShippingUpdate, getShippingUpdatesForProduct } from '../Controllers/shippingController.js';
import { verifyToken } from '../Middlewares/auth.js';

const router = express.Router();

// Post the Status of the Product only by Admin.
router.post('/update', verifyToken, postShippingUpdate);

// Get the Status of the Product only by Admin.
router.get('/get/:productId', verifyToken, getShippingUpdatesForProduct);


export default router;
