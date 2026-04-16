import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllowAccessToAllDocumentsAtToDoctorGrant1774316466051 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dv_patient_doctor_grant
        ADD COLUMN allow_access_to_all_documents_at TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dv_patient_doctor_grant
        DROP COLUMN allow_access_to_all_documents_at
    `);
  }
}
