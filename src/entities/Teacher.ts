import { Entity, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import { Student } from './Student';

@Entity('teachers')
export class Teacher {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    email!: string;

    @ManyToMany(() => Student, student => student.teachers, {
        cascade: true
    })
    @JoinTable({
        name: 'teacher_students',
        joinColumn: {
            name: 'teacher_email',
            referencedColumnName: 'email'
        },
        inverseJoinColumn: {
            name: 'student_email',
            referencedColumnName: 'email'
        }
    })
    students!: Student[];
}
