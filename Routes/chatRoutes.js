import express from 'express';
import { verifyToken, isAdmin } from '../Middlewares/auth.js';
import { postAdminReply, getMessages, getAllMessages, postMessage, getUserMessages } from '../Controllers/chatController.js';

const router = express.Router();

// Routes for users to post and get messages
router.post('/post-messages', verifyToken, postMessage);
router.get('/get-messages', verifyToken, getMessages);

// Route for admin to post replies
router.post('/admin-post-reply/:userId', verifyToken, isAdmin, postAdminReply);

// Route for admin to get all messages
router.get('/admin-get-all-messages', verifyToken, isAdmin, getAllMessages);

// Route to get specific user messages
router.get('/user-messages/:userId', verifyToken, isAdmin, getUserMessages);

export default router;
