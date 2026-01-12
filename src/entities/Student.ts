import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Teacher } from './Teacher';

@Entity('students')
export class Student {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    email!: string;

    @Column({ type: 'boolean', default: false, name: 'is_suspended' })
    isSuspended!: boolean;

    @ManyToMany(() => Teacher, teacher => teacher.students)
    @JoinTable({
        name: 'teacher_students',
        joinColumn: {
            name: 'student_email',
            referencedColumnName: 'email'
        },
        inverseJoinColumn: {
            name: 'teacher_email',
            referencedColumnName: 'email'
        }
    })
    teachers!: Teacher[];
}
