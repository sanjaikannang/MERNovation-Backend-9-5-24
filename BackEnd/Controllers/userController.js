import User from '../Models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Admin from '../Models/adminModel.js';

// Controller function for user signup
export const signup = async (req, res) => {
  try {
    const { username, email, password, role, phoneno } = req.body;

    // Check if the role is 'Admin', if yes, return with an error
    if (role === 'Admin') {
      return res.status(400).json({ message: 'Admin signup is not allowed' });
    }

    // Check if user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if phone number is provided
    if (!phoneno) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with hashed password
    const user = await User.create({ username, email, password: hashedPassword, role, phoneno });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10h' });

    // Send success response with token, user details, and role
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, phoneno: user.phoneno }, role: user.role });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
}


// Controller function for user login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Find the user based on the role
    let user;
    if (role === 'Admin') {
      user = await Admin.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }

    // If user is not found, throw an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Check if the role matches
    if (user.role !== role) {
      return res.status(401).json({ message: 'Invalid role' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10h' });

    // Send success response with token and user details
    return res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role, phoneno: user.phoneno, username: user.username } });
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};

