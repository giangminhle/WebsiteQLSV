class StudentController {
    constructor() {
        this.students = [];
    }

    addStudent(student) {
        this.students.push(student);
        return student;
    }

    deleteStudent(mssv) {
        const index = this.students.findIndex(student => student.mssv === mssv);
        if (index !== -1) {
            return this.students.splice(index, 1)[0];
        }
        return null;
    }

    getStudents() {
        return this.students;
    }

    getStudentByMSSV(mssv) {
        return this.students.find(student => student.mssv === mssv);
    }
}

export default StudentController;