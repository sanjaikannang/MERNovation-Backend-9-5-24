import Product from '../Models/productModel.js'; // Import Product model
import { uploadImages } from '../Services/cloudinaryService.js'; // Import uploadImages function


// CreateProduct controller 
export const createProduct = async (req, res) => {
  try {
    const { name, description, startingPrice, quantity, endTime } = req.body;

    // Check if the uploaded files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Cloudinary upload function for multiple images
    const uploadResults = await uploadImages(req.files);

    // Extract image URLs from upload results
    const imageUrls = uploadResults.map(result => result.secure_url);

    // Create product with image URLs
    const product = await Product.create({
      name,
      description,
      imageUrls, // Array of image URLs
      startingPrice,
      quantity,
      endTime,
      farmer: req.user._id // Assign farmer ID from authenticated user
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Update Product Controller
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, startingPrice, quantity, endTime } = req.body;

    // Find the product by ID
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields
    product.name = name;
    product.description = description;
    product.startingPrice = startingPrice;
    product.quantity = quantity;
    product.endTime = endTime;

    // Update images if uploaded
    if (req.files && req.files.length > 0) {
      // Cloudinary upload function for multiple images
      const uploadResults = await uploadImages(req.files);

      // Extract image URLs from upload results
      const imageUrls = uploadResults.map(result => result.secure_url);

      // Replace existing image URLs with new ones
      product.imageUrls = imageUrls;
    }

    // Save the updated product
    product = await product.save();

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Delete product controller function
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// GetAll Products Controller
export const getAllProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Get-Specific Product Details Controller
export const getSpecificProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};