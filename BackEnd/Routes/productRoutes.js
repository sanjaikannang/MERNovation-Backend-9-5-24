import express from 'express';
import { createProduct, updateProduct, deleteProduct, getAllProduct, getSpecificProduct } from '../Controllers/productController.js'; // Import controller function
import auth from '../Middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle product creation with image upload
router.post('/create', auth, upload.array('image', 3), createProduct); // Allow up to 3 images

// Route to handle product update
router.put('/update/:id', auth, upload.array('image', 3), updateProduct); // Allow up to 3 images

// Route to handle product deletion
router.delete('/delete/:id', auth, deleteProduct);

// Route to GetAll the Products
router.get("/getall", getAllProduct);

// Route to Get-Specific Product using the product ID
router.get("/get-specific/:id", getSpecificProduct);


export default router;
