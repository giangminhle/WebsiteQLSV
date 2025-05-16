const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

const authController = new AuthController();

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

module.exports = router;