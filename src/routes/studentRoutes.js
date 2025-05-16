const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');

const studentController = new StudentController();

// Route to add a new student
router.post('/add', studentController.addStudent);

// Route to delete a student
router.delete('/delete/:mssv', studentController.deleteStudent);

// Route to get all students
router.get('/', studentController.getAllStudents);

// Route to get a student by MSSV
router.get('/:mssv', studentController.getStudentByMSSV);

module.exports = router;