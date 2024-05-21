import express from 'express';
import { verifyToken, isAdmin, isBuyer } from '../Middlewares/auth.js';
import { uploadProduct, verifyProduct, getProducts, getSpecificProduct, getCurrentLoginProducts, getAllAcceptedProducts, placeBid, getBidsForProduct, handlePaymentForProduct, deleteProduct, getCurrentLoginBuyerDetails } from '../Controllers/productController.js';
import multer from 'multer';

const router = express.Router();

// Configure Multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage for handling file buffers
const upload = multer({ storage: storage });
const myUploadMiddleware = upload.array('photos', 3); // 'photos' is the field name, and 4 is the maximum number of files

// Route for uploading a product by Farmer
router.post('/upload', verifyToken, myUploadMiddleware, uploadProduct);

// Route for verifying a product by Admin
router.put('/verify/:productId', verifyToken, isAdmin, verifyProduct);

// Route for getting all products ( All Product )
router.get('/get-all-products-all', getProducts);

// Route for getting Specific product details 
router.get('/get-specific-product/:productId', getSpecificProduct);

// Route to geet the Current Login Farmer Product Details 
router.get("/get-login-products", verifyToken, getCurrentLoginProducts);

// Route For current login buyer details
router.get("/get-login-buyer-details", verifyToken, getCurrentLoginBuyerDetails);

// Route for getting all products for Buyer ( Accepted Product Only )
router.get('/get-all-products-accepted', getAllAcceptedProducts);

// Route for placing a bid on a product
router.post('/bid-product/:productId', verifyToken, isBuyer, placeBid);

// Route for getting all bids for a product
router.get('/get-all-bids/:productId', getBidsForProduct);

// Route for Payment for a product
router.get('/pay/:productId', verifyToken, isBuyer, handlePaymentForProduct);

// Route For Deleeting the Product 
router.delete("/delete/:productId", verifyToken, isAdmin, deleteProduct);

export default router;
