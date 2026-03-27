import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAllowAccessToAllDocumentsColumn1775000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dv_patient_access_code
        ADD COLUMN allow_access_to_all_documents BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE dv_patient_doctor_grant
        ADD COLUMN allow_access_to_all_documents BOOLEAN NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE dv_patient_institution_grant
        ADD COLUMN allow_access_to_all_documents BOOLEAN NOT NULL DEFAULT false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dv_patient_institution_grant
        DROP COLUMN allow_access_to_all_documents
    `);

    await queryRunner.query(`
      ALTER TABLE dv_patient_doctor_grant
        DROP COLUMN allow_access_to_all_documents
    `);

    await queryRunner.query(`
      ALTER TABLE dv_patient_access_code
        DROP COLUMN allow_access_to_all_documents
    `);
  }
}
