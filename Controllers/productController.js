import Product from '../Models/productModel.js';
import Bid from "../Models/bidModel.js";
import handleUpload from '../Services/cloudinaryService.js';

// Function to Upload Product By the Farmer Role.
export const uploadProduct = async (req, res) => {
  try {
    // Check if user is a Farmer
    if (req.user.role !== 'Farmer') {
      // If user is not a Farmer, return Forbidden response
      return res.status(403).json({ message: 'Forbidden: Only Farmers can upload products' });
    }

    // Check if files are uploaded and there are exactly 3 images
    if (!req.files || req.files.length !== 3) {
      return res.status(400).json({ message: 'Please upload exactly 3 images' });
    }

    const imageUrls = [];
    for (const file of req.files) {
      // Convert each image buffer to base64 data URL
      const fileDataURI = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      // Upload image to Cloudinary
      const cldRes = await handleUpload(fileDataURI);
      imageUrls.push(cldRes.secure_url);
    }

    // Create new product
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      startingPrice: req.body.startingPrice,
      startingDate: req.body.startingDate,
      endingDate: req.body.endingDate,
      quantity: req.body.quantity,
      images: imageUrls,
      farmer: req.user._id // Assign the farmer ID to the product
    });

    // Save product to database
    const savedProduct = await newProduct.save();

    // Send response with product details and farmer details
    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct,
      farmer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      }
    });
  } catch (error) {
    console.error('Error uploading product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Controller to verify product
export const verifyProduct = async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      // If user is not an admin, return Forbidden response
      return res.status(403).json({ message: 'Forbidden: Only admins can verify products' });
    }

    const { productId } = req.params; // Get product ID from request parameters
    const { status, rejectionReason } = req.body; // Get status and rejection reason from request body

    const product = await Product.findById(productId); // Find the product by ID
    if (!product) {
      return res.status(404).json({ message: 'Product not found' }); // If product not found, return Not Found response
    }

    if (status === 'accepted' || status === 'rejected') {
      // If status is accepted or rejected, update product status accordingly
      product.status = status;
      if (status === 'rejected') {
        // If status is rejected, add rejection reason
        product.rejectionReason = rejectionReason;
      } else if (status === 'accepted') {
        // If status is accepted, mark product quality as initially not verified
        product.quality = 'Verified';
      }
      // Save the updated product
      await product.save();
      return res.status(200).json({ message: `Product ${status}`, product });
    } else {
      return res.status(400).json({ message: 'Invalid status' }); // If status is invalid, return Bad Request response
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' }); // If an error occurs, return Internal Server Error response
  }
};


// Controller to get all Products with Farmer Details
export const getProducts = async (req, res) => {
  try {
      const products = await Product.find().populate('farmer', 'name email phoneNo');

      if (!products || products.length === 0) {
          return res.status(404).json({ message: "No products found" });
      }

      res.status(200).json(products);
  } catch (error) {
      console.error("Error in getProducts controller:", error.message);
      res.status(500).json({ message: "Server Error" });
  }
};


// Controller to get all products with farmer details for Buyers (Accepted Product Only)
export const getAllAcceptedProducts = async (req, res) => {
  try {
      const products = await Product.find({ status: 'accepted' }).populate('farmer', 'name email phoneNo');

      if (!products || products.length === 0) {
          return res.status(404).json({ message: "No accepted products found" });
      }

      res.status(200).json(products);
  } catch (error) {
      console.error("Error in getAllAcceptedProducts controller:", error.message);
      res.status(500).json({ message: "Server Error" });
  }
};


// Controller to get the Specific Product Details
export const getSpecificProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId).populate('farmer', 'name email phoneNo');

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error in getSpecificProduct controller:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// Controller to get the Product Details of Current Login Farmer
export const getCurrentLoginProducts = async (req, res) => {
  try {
    // Get the user information from headers
    const user = req.user;

    // Check if the user is a farmer
    if (user.role !== 'Farmer') {
      return res.status(403).json({ message: "Access forbidden. Only farmers can access this resource." });
    }

    // Get the products of the current farmer
    const products = await Product.find({ farmer: user._id });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for the current farmer" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getCurrentLoginProducts controller:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// Controller to place a bid on a product
export const placeBid = async (req, res) => {
  try {
    const { productId } = req.params;
    const { bidAmount } = req.body;
    const userId = req.user._id;

    // Check if the bid amount is valid
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (bidAmount <= product.startingPrice) {
      return res.status(400).json({ message: "Bid amount must be higher than the starting price" });
    }

    // Check if bidding window is open
    const currentDate = new Date();
    if (currentDate < product.startingDate || currentDate > product.endingDate) {
      return res.status(400).json({ message: "Bidding for this product is closed" });
    }

    // Get the highest bid for the product
    const highestBid = await Bid.findOne({ product: productId }).sort({ amount: -1 });
    const highestBidAmount = highestBid ? highestBid.amount : product.startingPrice;

    // Check if the bid amount is higher than the highest bid
    if (bidAmount <= highestBidAmount) {
      return res.status(400).json({ message: "Bid amount must be higher than the highest bid" });
    }

    // Check if the user already has a bid on this product
    const existingBid = await Bid.findOne({ product: productId, bidder: userId });
    if (existingBid && bidAmount <= existingBid.amount) {
      return res.status(400).json({ message: "Bid amount must be higher than your previous bid" });
    }

    // Create a new bid
    const newBid = new Bid({
      product: productId,
      bidder: userId,
      amount: bidAmount
    });

    // Save the bid
    await newBid.save();

    res.status(201).json({ message: "Bid placed successfully", bid: newBid });
  } catch (error) {
    console.error("Error placing bid:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// Controller to get all bids for a product
export const getBidsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get all bids for the product
    const bids = await Bid.find({ product: productId }).populate('bidder', 'name');

    res.status(200).json(bids);
  } catch (error) {
    console.error("Error getting bids for product:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


