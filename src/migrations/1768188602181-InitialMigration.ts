import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1768188602181 implements MigrationInterface {
    name = 'InitialMigration1768188602181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`students\` (\`email\` varchar(255) NOT NULL, \`is_suspended\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`email\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`teachers\` (\`email\` varchar(255) NOT NULL, PRIMARY KEY (\`email\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`teacher_students\` (\`student_email\` varchar(255) NOT NULL, \`teacher_email\` varchar(255) NOT NULL, INDEX \`IDX_b66b0531c641ae33dca35eb314\` (\`student_email\`), INDEX \`IDX_81753dd9ba40e57515fdf8054f\` (\`teacher_email\`), PRIMARY KEY (\`student_email\`, \`teacher_email\`)) ENGINE=InnoDB`);

        // Add foreign keys only if they don't exist
        const hasFk1 = await queryRunner.query(`
            SELECT COUNT(*) as count FROM information_schema.TABLE_CONSTRAINTS 
            WHERE CONSTRAINT_NAME = 'FK_b66b0531c641ae33dca35eb3140' 
            AND TABLE_SCHEMA = DATABASE()
        `);
        if (hasFk1[0].count === 0) {
            await queryRunner.query(`ALTER TABLE \`teacher_students\` ADD CONSTRAINT \`FK_b66b0531c641ae33dca35eb3140\` FOREIGN KEY (\`student_email\`) REFERENCES \`students\`(\`email\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        }

        const hasFk2 = await queryRunner.query(`
            SELECT COUNT(*) as count FROM information_schema.TABLE_CONSTRAINTS 
            WHERE CONSTRAINT_NAME = 'FK_81753dd9ba40e57515fdf8054fb' 
            AND TABLE_SCHEMA = DATABASE()
        `);
        if (hasFk2[0].count === 0) {
            await queryRunner.query(`ALTER TABLE \`teacher_students\` ADD CONSTRAINT \`FK_81753dd9ba40e57515fdf8054fb\` FOREIGN KEY (\`teacher_email\`) REFERENCES \`teachers\`(\`email\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teacher_students\` DROP FOREIGN KEY \`FK_81753dd9ba40e57515fdf8054fb\``);
        await queryRunner.query(`ALTER TABLE \`teacher_students\` DROP FOREIGN KEY \`FK_b66b0531c641ae33dca35eb3140\``);
        await queryRunner.query(`DROP INDEX \`IDX_81753dd9ba40e57515fdf8054f\` ON \`teacher_students\``);
        await queryRunner.query(`DROP INDEX \`IDX_b66b0531c641ae33dca35eb314\` ON \`teacher_students\``);
        await queryRunner.query(`DROP TABLE \`teacher_students\``);
        await queryRunner.query(`DROP TABLE \`teachers\``);
        await queryRunner.query(`DROP TABLE \`students\``);
    }

}
