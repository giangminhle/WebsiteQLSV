class ClassController {
    constructor() {
        this.classes = []; // Array to hold class data
    }

    addClass(classData) {
        this.classes.push(classData);
        return { message: 'Class added successfully', class: classData };
    }

    deleteClass(className) {
        const index = this.classes.findIndex(c => c.name === className);
        if (index !== -1) {
            this.classes.splice(index, 1);
            return { message: 'Class deleted successfully' };
        }
        return { message: 'Class not found' };
    }

    getClasses() {
        return this.classes;
    }
}

module.exports = ClassController;