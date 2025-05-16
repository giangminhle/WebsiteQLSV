const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/classController');

const classController = new ClassController();

// Route to add a new class
router.post('/add', classController.addClass);

// Route to delete a class
router.delete('/delete/:id', classController.deleteClass);

// Route to get all classes
router.get('/', classController.getAllClasses);

module.exports = router;