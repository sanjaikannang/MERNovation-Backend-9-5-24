import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';

import connectDB from "./connectMongoDB.js";
import userRoutes from "./Routes/userRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import chatRoutes from "./Routes/chatRoutes.js"
import paymentRoutes from "./Routes/paymentRoutes.js"
import shippingRoutes from "./Routes/shippingRoutes.js"

dotenv.config();
connectDB();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  chunk_size: 100000000,// 100 MB 
  timeout: 1000000, // 10 minutes
});

const app = express();
app.use(express.json());
app.use(cors());

// API Endpoints
app.use('/user', userRoutes); // User Routes
app.use('/product', productRoutes); // User Routes
app.use('/chat', chatRoutes); // Chat Routes
app.use('/payment', paymentRoutes); // Payment Routes
app.use('/shipping', shippingRoutes); // Shipping Routes

// app.use('/',(req, res) => {
//     res.send("This is a MERNovation 'HarverstHub' Project !!!")
// })

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
