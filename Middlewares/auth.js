import jwt from 'jsonwebtoken'; 
import User from '../Models/userModel.js'; 

// Middleware to verify user's token
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // Get the token from the request headers
    if (!token) return res.status(401).json({ message: 'Unauthorized' }); // If no token, return Unauthorized

    // Verify the token
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' }); // If token verification fails, return Unauthorized

        try {
            const user = await User.findById(decoded.userId); // Find the user associated with the decoded token
            if (!user) return res.status(401).json({ message: 'Unauthorized' }); // If no user found, return Unauthorized

            req.user = user; // Attach the user object to the request
            next(); // Call the next middleware
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' }); // If an error occurs, return Internal Server Error
        }
    });
};

// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') { // Check if user role is not admin
        return res.status(403).json({ message: 'Forbidden' }); // If not admin, return Forbidden
    }
    next(); // Call the next middleware
};

// Middleware to check if the user is a buyer
export const isBuyer = (req, res, next) => {
    // Check if user role is 'Buyer'
    if (req.user && req.user.role === 'Buyer') {
      next(); // If user is a buyer, proceed to the next middleware or route handler
    } else {
      // If user is not a buyer, return Forbidden response
      return res.status(403).json({ message: 'Forbidden: Only Buyers can perform this action' });
    }
  };
  