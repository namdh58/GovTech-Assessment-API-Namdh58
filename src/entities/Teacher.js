const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Teacher',
    tableName: 'teachers',
    columns: {
        email: {
            primary: true,
            type: 'varchar',
            length: 255
        }
    },
    relations: {
        students: {
            target: 'Student',
            type: 'many-to-many',
            joinTable: {
                name: 'teacher_students',
                joinColumn: {
                    name: 'teacher_email',
                    referencedColumnName: 'email'
                },
                inverseJoinColumn: {
                    name: 'student_email',
                    referencedColumnName: 'email'
                }
            },
            cascade: true
        }
    }
});
