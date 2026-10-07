import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientAccessGrantRelatedTables1774316466050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE dv_patient_doctor_grant (
        id                            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id                    UUID      NOT NULL,
        doctor_id                     UUID      NOT NULL,
        documents_ids                 TEXT[]    NULL,
        revoked_at                    TIMESTAMP NULL,
        liked_by_patient              BOOLEAN   NOT NULL DEFAULT false,
        liked_by_doctor               BOOLEAN   NOT NULL DEFAULT false,
        persistent                    BOOLEAN   NOT NULL DEFAULT false,
        allow_access_to_all_documents BOOLEAN   NOT NULL DEFAULT false,
        is_active                     BOOLEAN   NOT NULL DEFAULT true,
        created_at                    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at                    TIMESTAMP NULL,
        deleted_at                    TIMESTAMP NULL,
        CONSTRAINT fk_patient_doctor_grant_patient
          FOREIGN KEY (patient_id) REFERENCES dv_patient(id),
        CONSTRAINT fk_patient_doctor_grant_doctor
          FOREIGN KEY (doctor_id) REFERENCES dv_doctor(id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_doctor_grant_patient_id" ON dv_patient_doctor_grant (patient_id)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_doctor_grant_doctor_id" ON dv_patient_doctor_grant (doctor_id)
    `);

    await queryRunner.query(`
      CREATE TABLE dv_patient_institution_grant (
        id                            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id                    UUID      NOT NULL,
        institution_id                UUID      NOT NULL,
        documents_ids                 TEXT[]    NULL,
        revoked_at                    TIMESTAMP NULL,
        liked_by_patient              BOOLEAN   NOT NULL DEFAULT false,
        liked_by_institution          BOOLEAN   NOT NULL DEFAULT false,
        persistent                    BOOLEAN   NOT NULL DEFAULT false,
        allow_access_to_all_documents BOOLEAN   NOT NULL DEFAULT false,
        is_active                     BOOLEAN   NOT NULL DEFAULT true,
        created_at                    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at                    TIMESTAMP NULL,
        deleted_at                    TIMESTAMP NULL,
        CONSTRAINT fk_patient_institution_grant_patient
          FOREIGN KEY (patient_id) REFERENCES dv_patient(id),
        CONSTRAINT fk_patient_institution_grant_institution
          FOREIGN KEY (institution_id) REFERENCES dv_institution(id)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_institution_grant_patient_id" ON dv_patient_institution_grant (patient_id)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_institution_grant_institution_id" ON dv_patient_institution_grant (institution_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_institution_grant_institution_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_institution_grant_patient_id"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS dv_patient_institution_grant`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_doctor_grant_doctor_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_doctor_grant_patient_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS dv_patient_doctor_grant`);
  }
}
