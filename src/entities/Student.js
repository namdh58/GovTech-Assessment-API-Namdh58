const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Student',
    tableName: 'students',
    columns: {
        email: {
            primary: true,
            type: 'varchar',
            length: 255
        },
        isSuspended: {
            type: 'boolean',
            default: false,
            name: 'is_suspended'
        }
    },
    relations: {
        teachers: {
            target: 'Teacher',
            type: 'many-to-many',
            joinTable: {
                name: 'teacher_students',
                joinColumn: {
                    name: 'student_email',
                    referencedColumnName: 'email'
                },
                inverseJoinColumn: {
                    name: 'teacher_email',
                    referencedColumnName: 'email'
                }
            }
        }
    }
});
