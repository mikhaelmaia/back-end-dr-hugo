import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenderToPatientAndDoctor1775100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dv_patient
        ADD COLUMN gender VARCHAR(10) NOT NULL DEFAULT 'Outro'
    `);

    await queryRunner.query(`
      ALTER TABLE dv_doctor
        ADD COLUMN gender VARCHAR(10) NOT NULL DEFAULT 'Outro'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dv_doctor
        DROP COLUMN gender
    `);

    await queryRunner.query(`
      ALTER TABLE dv_patient
        DROP COLUMN gender
    `);
  }
}
