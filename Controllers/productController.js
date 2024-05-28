import Product from '../Models/productModel.js';
import Bid from "../Models/bidModel.js";
import handleUpload from '../Services/cloudinaryService.js';
import mongoose from "mongoose";
import moment from 'moment-timezone';
import { sendWinningBidEmail } from '../Utils/emailService.js';
import { scheduleCronJob } from "../Cron/cronJobs.js";
import capturePayment from "../Utils/paymentProcessor.js"

// Function to Upload Product By the Farmer Role.
export const uploadProduct = async (req, res) => {
  try {
    // Check if the user is a Farmer
    if (req.user.role !== 'Farmer') {
      return res.status(403).json({ message: 'Forbidden: Only Farmers can upload products' });
    }

    // Check if exactly 3 images are uploaded
    if (!req.files || req.files.length !== 3) {
      return res.status(400).json({ message: 'Please upload exactly 3 images' });
    }

    // Destructure the necessary fields from the request body
    const { bidStartTime, bidEndTime, startingDate, endingDate, name, description, startingPrice, quantity } = req.body;

    // Convert provided IST times to Date objects without converting to UTC
    const bidStart = new Date(bidStartTime);
    const bidEnd = new Date(bidEndTime);
    const start = new Date(startingDate);
    const end = new Date(endingDate);

    // Validate bid start and end times
    const minDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
    const maxDuration = 1 * 60 * 60 * 1000; // 1 hours in milliseconds

    if (bidStart < start || bidEnd > end || (bidEnd - bidStart) < minDuration || (bidEnd - bidStart) > maxDuration) {
      return res.status(400).json({
        message: 'Invalid bidding time. Ensure bidding time is within the given date range and between 10 minutes and 2 hours.'
      });
    }

    // Array to hold the URLs of the uploaded images
    const imageUrls = [];


    // Loop through the uploaded files and upload them to Cloudinary
    for (const file of req.files) {
      if (!file.mimetype || !file.buffer) {
        throw new Error('Invalid file data');
      }
      const fileDataURI = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`; // Convert file buffer to Data URI
      // console.log(fileDataURI);

      const cldRes = await handleUpload(fileDataURI); // Upload to Cloudinary
      imageUrls.push(cldRes.secure_url); // Add the secure URL to the array
    }

    // Create a new Product object with the provided times
    const newProduct = new Product({
      name,
      description,
      startingPrice,
      startingDate: start,
      endingDate: end,
      bidStartTime: bidStart,
      bidEndTime: bidEnd,
      quantity,
      images: imageUrls,
      farmer: req.user._id
    });

    // Save the new product to the database
    const savedProduct = await newProduct.save();

    // Respond with success message and product details

    const savedProductIST = {
      ...savedProduct.toObject(),
      startingDate: moment.utc(savedProduct.startingDate).tz('Asia/Kolkata').format(),
      endingDate: moment.utc(savedProduct.endingDate).tz('Asia/Kolkata').format(),
      bidStartTime: moment.utc(savedProduct.bidStartTime).format(),
      bidEndTime: moment.utc(savedProduct.bidEndTime).format()
    };

    console.log(savedProductIST);

    res.status(201).json({
      message: 'Product created successfully',
      product: savedProductIST,
      farmer: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      }
    });
  } catch (error) {
    // Handle any errors that occur
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
      // Return response with current time in IST format
      return res.status(200).json({
        message: `Product ${status}`,
        product: {
          ...product.toObject(),
          bidStartTime: moment(product.bidStartTime).tz('Asia/Kolkata').format(),
          bidEndTime: moment(product.bidEndTime).tz('Asia/Kolkata').format()
        },
        currentTimeIST: moment().tz('Asia/Kolkata').format()
      });
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
    const currentTimeIST = moment().tz('Asia/Kolkata').format(); // Get current time in IST format

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found", currentTimeIST });
    }

    // Format bid start time and end time in IST format for each product
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      bidStartTime: moment(product.bidStartTime).format(),
      bidEndTime: moment(product.bidEndTime).format()
    }));

    // Return response with formatted products and current time in IST format
    res.status(200).json({ products: formattedProducts, currentTimeIST });
  } catch (error) {
    console.error("Error in getProducts controller:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



// Controller to get all products with farmer details for Buyers (Accepted Product Only)
export const getAllAcceptedProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'accepted' }).populate('farmer', 'name email phoneNo');
    const currentTimeIST = moment().tz('Asia/Kolkata').format(); // Get current time in IST format

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No accepted products found", currentTimeIST });
    }

    // Format bid start time and end time in IST format for each product
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      bidStartTime: moment(product.bidStartTime).tz('Asia/Kolkata').format(),
      bidEndTime: moment(product.bidEndTime).tz('Asia/Kolkata').format()
    }));

    // Return response with formatted products and current time in IST format
    res.status(200).json({ products: formattedProducts, currentTimeIST });
  } catch (error) {
    console.error("Error in getAllAcceptedProducts controller:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};



// Controller to get the Specific Product Details
export const getSpecificProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const product = await Product.findById(productId)
      .populate('farmer', 'name email phoneNo') // Populate farmer details
      .populate({
        path: 'bids',
        select: 'bidder amount createdAt', // Select fields from Bid model
        populate: {
          path: 'bidder',
          select: 'name' // Select name of the bidder
        }
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Format bid start time and end time in IST format
    const formattedProduct = {
      ...product.toObject(),
      bidStartTime: moment(product.bidStartTime).tz('Asia/Kolkata').format(),
      bidEndTime: moment(product.bidEndTime).tz('Asia/Kolkata').format()
    };

    res.status(200).json(formattedProduct);
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

    // Format bid start time and end time for each product
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      bidStartTime: moment(product.bidStartTime).tz('Asia/Kolkata').format(),
      bidEndTime: moment(product.bidEndTime).tz('Asia/Kolkata').format()
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error("Error in getCurrentLoginProducts controller:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// Controller to get the current login Buyer details 
export const getCurrentLoginBuyerDetails = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user token provided.' });
    }

    // Check if the authenticated user has the role of "Buyer"
    if (req.user.role !== 'Buyer') {
      return res.status(403).json({ message: 'Forbidden: Only buyers are allowed to access this resource.' });
    }

    // Fetch buyer details from your database or wherever they are stored
    const buyerDetails = {
      // Include whatever buyer details you want to return
      // For example:
      username: req.user.username,
      email: req.user.email,
      // Include any other relevant buyer information
    };

    // Find the winning product
    const winningProduct = await Product.findOne({
      'highestBid.bidder': req.user._id,
      biddingStatus: 'Bidding Ended'
    }).populate('bids.bidder'); // Populate the bidder details in bids array

    // Respond with the buyer details and winning product
    res.status(200).json({ buyer: buyerDetails, winningProduct });
  } catch (error) {
    console.error('Error getting current login buyer details:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};



scheduleCronJob();

// Controller function to place a bid on a product
export const placeBid = async (req, res) => {
  try {
    const { productId } = req.params; // Get product ID from request params
    const { bidAmount } = req.body; // Get bid amount from request body

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Find the product by ID and populate bids and highestBid.bidder
    const product = await Product.findById(productId).populate('bids').populate('highestBid.bidder');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get current time in IST using Moment.js
    const currentTimeIST = moment().tz('Asia/Kolkata');

    // Check if current time is within bidding time
    if (currentTimeIST < moment(product.bidStartTime).tz('Asia/Kolkata') ||
      currentTimeIST > moment(product.bidEndTime).tz('Asia/Kolkata')) {
      return res.status(400).json({ message: 'Bidding time is not valid' });
    }

    // Check if bid amount is higher than current highest bid
    if (bidAmount <= product.startingPrice ||
      (product.highestBid && bidAmount <= product.highestBid.amount)) {
      return res.status(400).json({ message: 'Bid amount must be higher than the current highest bid' });
    }

    // Create a new Bid object
    const newBid = new Bid({
      product: productId,
      bidder: req.user._id,
      amount: bidAmount,
      bidTime: currentTimeIST,
    });

    // Save the new bid to the database
    await newBid.save();

    // Update product's bids array and highest bid
    product.bids.push(newBid._id);
    product.highestBid = {
      bidder: req.user._id,
      amount: bidAmount,
      bidTime: currentTimeIST,
    };

    // Save the updated product to the database
    await product.save();

    // Check if bidding time has ended
    if (currentTimeIST > moment(product.bidEndTime).tz('Asia/Kolkata')) {
      // console.log('Bidding time has ended. Sending email to the winning bidder...');

      // Update product bidding status to indicate bidding has ended
      product.biddingStatus = 'Bidding Ended';
      await product.save();

      // Send email to the winning bidder
      await sendWinningBidEmail(product.highestBid.bidder.email, product);
    }

    // Respond with success message and the new bid
    res.status(201).json({
      message: 'Bid placed successfully',
      bid: newBid,
    });
  } catch (error) {
    // console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// Controller to get all bids for a product
export const getBidsForProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Get product ID from request params

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Get the product to access bid start and end times
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Format bid start time and end time
    const bidStartTime = moment(product.bidStartTime).tz('Asia/Kolkata').format();
    const bidEndTime = moment(product.bidEndTime).tz('Asia/Kolkata').format();

    // Get all bids for the product
    const bids = await Bid.find({ product: productId }).populate('bidder', 'name email');

    // Get the highest bid for the product
    const highestBid = await Bid.findOne({ product: productId }).sort({ amount: -1 }).populate('bidder', 'name email');

    res.status(200).json({ bids, highestBid, bidStartTime, bidEndTime });
  } catch (error) {
    // console.error("Error getting bids for product:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};


// Controller for deleting the product
export const deleteProduct = async (req, res) => {
  try {
    // Check if the user is authenticated and has admin role
    if (req.user && req.user.role === 'admin') {
      // Extract product ID from request parameters
      const { productId } = req.params;

      // Your logic to delete the product by its ID (Assuming you have a Product model)
      await Product.findByIdAndDelete(productId);

      // Respond with success message
      return res.status(200).json({ message: 'Product deleted successfully.' });
    } else {
      // If user is not authenticated or does not have admin role, respond with unauthorized error
      return res.status(401).json({ message: 'Unauthorized to delete product.' });
    }
  } catch (error) {
    // If an error occurs, respond with an error message
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


// Controller function to handle payment for the product
export const handlePaymentForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, amount } = req.body;

    // Check if the user making the payment is the winning bidder for the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'accepted' || product.highestBid.bidder.toString() !== userId) {
      return res.status(403).json({ message: 'You are not the winning bidder for this product' });
    }

    // Proceed with capturing payment
    const response = await capturePayment(req.body, req.headers['x-razorpay-signature']);

    // Handle response and update payment status in your system
    // For example, update product status to indicate successful payment

    res.status(200).json({ message: 'Payment captured successfully' });
  } catch (error) {
    console.error('Error capturing payment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
