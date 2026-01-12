import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import SchoolService from '../../src/services/SchoolService';
import { StudentRepository } from '../../src/repositories/StudentRepository';
import { TeacherRepository } from '../../src/repositories/TeacherRepository';
import { AppDataSource } from '../../src/config/data-source';
import { NotFoundError, BadRequestError } from '../../src/utils/exceptions';

// Mock everything
// Mock with factory to prevent module loading side-effects
jest.mock('../../src/repositories/StudentRepository', () => ({
    StudentRepository: {
        findCommonStudents: jest.fn(),
        findRecipients: jest.fn(),
        findByEmails: jest.fn(),
        findOneBy: jest.fn(),
        update: jest.fn(),
    }
}));
jest.mock('../../src/repositories/TeacherRepository', () => ({
    TeacherRepository: {
        findByEmails: jest.fn(),
    }
}));
jest.mock('../../src/config/data-source', () => ({
    AppDataSource: {
        createQueryRunner: jest.fn(),
        getRepository: jest.fn(),
        initialize: jest.fn(),
    }
}));

describe('SchoolService', () => {
    let mockQueryRunner: any;

    beforeEach(() => {
        // Setup QueryRunner mock for Transactional methods
        mockQueryRunner = {
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn(),
            manager: {
                findOne: jest.fn(),
                findBy: jest.fn(),
                insert: jest.fn(),
                createQueryBuilder: jest.fn(() => ({
                    leftJoinAndSelect: jest.fn().mockReturnThis(),
                    where: jest.fn().mockReturnThis(),
                    andWhere: jest.fn().mockReturnThis(),
                    relation: jest.fn().mockReturnThis(),
                    of: jest.fn().mockReturnThis(),
                    add: jest.fn().mockReturnThis(),
                    getOne: jest.fn(),
                })),
            }
        };
        (AppDataSource.createQueryRunner as any).mockReturnValue(mockQueryRunner);
    });

    describe('register', () => {
        it('should register students successfully', async () => {
            // Mock Teacher exists
            const mockTeacher = { email: 'teacher@gmail.com', students: [] };
            mockQueryRunner.manager.findOne.mockResolvedValue(mockTeacher);

            // Mock Existing Students
            mockQueryRunner.manager.findBy.mockResolvedValue([]);

            // Mock Existing Link checks
            // The service calls queryBuilder to check existing links
            const mockQB = mockQueryRunner.manager.createQueryBuilder();
            mockQB.getOne.mockResolvedValue({ students: [] }); // No existing links
            mockQueryRunner.manager.createQueryBuilder.mockReturnValue(mockQB);

            await SchoolService.register('teacher@gmail.com', ['student@gmail.com']);

            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.manager.insert).toHaveBeenCalled(); // Should insert new student
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });

        it('should throw NotFoundError if teacher does not exist', async () => {
            mockQueryRunner.manager.findOne.mockResolvedValue(null);

            await expect(SchoolService.register('teacher@gmail.com', ['student@gmail.com']))
                .rejects.toThrow(NotFoundError);

            expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
        });
    });

    describe('getCommonStudents', () => {
        it('should return common students for one teacher', async () => {
            (TeacherRepository.findByEmails as any).mockResolvedValue([{ email: 'teacher@gmail.com' }]);
            (StudentRepository.findCommonStudents as any).mockResolvedValue([{ email: 'student@gmail.com' }]);

            const result = await SchoolService.getCommonStudents(['teacher@gmail.com']);

            expect(result).toEqual({ students: ['student@gmail.com'] });
        });

        it('should return common students for two teachers', async () => {
            (TeacherRepository.findByEmails as any).mockResolvedValue([{ email: 't1@gmail.com' }, { email: 't2@gmail.com' }]);
            (StudentRepository.findCommonStudents as any).mockResolvedValue([{ email: 'common@gmail.com' }]);

            const result = await SchoolService.getCommonStudents(['t1@gmail.com', 't2@gmail.com']);
            expect(result).toEqual({ students: ['common@gmail.com'] });
        });

        it('should throw NotFoundError if a teacher is missing', async () => {
            (TeacherRepository.findByEmails as any).mockResolvedValue([{ email: 't1@gmail.com' }]);

            await expect(SchoolService.getCommonStudents(['t1@gmail.com', 'missing@gmail.com']))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('suspend', () => {
        it('should suspend a student successfully', async () => {
            const mockStudent = { email: 'student@gmail.com', isSuspended: false };
            (StudentRepository.findOneBy as any).mockResolvedValue(mockStudent);

            await SchoolService.suspend('student@gmail.com');

            expect(StudentRepository.update).toHaveBeenCalledWith({ email: 'student@gmail.com' }, { isSuspended: true });
        });

        it('should throw NotFoundError if student not found', async () => {
            (StudentRepository.findOneBy as any).mockResolvedValue(null);

            await expect(SchoolService.suspend('unknown@gmail.com'))
                .rejects.toThrow(NotFoundError);
        });

        it('should throw BadRequestError if student already suspended', async () => {
            const mockStudent = { email: 'student@gmail.com', isSuspended: true };
            (StudentRepository.findOneBy as any).mockResolvedValue(mockStudent);

            await expect(SchoolService.suspend('student@gmail.com'))
                .rejects.toThrow(BadRequestError);
        });
    });

    describe('retrieveForNotifications', () => {
        it('should return recipients with mentions', async () => {
            const mockRecipients = [{ email: 'student@gmail.com' }];
            (StudentRepository.findRecipients as any).mockResolvedValue(mockRecipients);
            // Mock that mentioned student exists
            (StudentRepository.findByEmails as any).mockResolvedValue([{ email: 'student@gmail.com' }]);

            const result = await SchoolService.retrieveForNotifications('teacher@gmail.com', 'Hello @student@gmail.com');

            expect(result.recipients).toContain('student@gmail.com');
            expect(result.studentNotFound).toHaveLength(0);
        });

        it('should return studentNotFound if mentioned student does not exist', async () => {
            (StudentRepository.findRecipients as any).mockResolvedValue([]);
            (StudentRepository.findByEmails as any).mockResolvedValue([]); // No students exist

            const result = await SchoolService.retrieveForNotifications('teacher@gmail.com', 'Hello @ghost@gmail.com');

            expect(result.recipients).toHaveLength(0);
            expect(result.studentNotFound).toContain('ghost@gmail.com');
        });
    });
});
