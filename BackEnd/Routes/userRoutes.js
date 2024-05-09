import express from 'express';
import { signup, login } from '../Controllers/userController.js';

const router = express.Router();

router.post('/signup', signup); // SignUp Routes
router.post('/login', login);  // Login Routes

export default router;
