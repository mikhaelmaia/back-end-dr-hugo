import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientAccessCodeTable1770600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ENUM ─────────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TYPE "institutional_user_role_enum" AS ENUM('DOCTOR', 'INSTITUTION')
    `);

    // ─── dv_patient_access_code ───────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_patient_access_code" (
        "id"                            uuid                          NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"                     boolean                       NOT NULL DEFAULT true,
        "created_at"                    TIMESTAMP                     NOT NULL DEFAULT now(),
        "updated_at"                    TIMESTAMP                     DEFAULT now(),
        "deleted_at"                    TIMESTAMP,
        "patient_id"                    uuid                          NOT NULL,
        "code"                          character varying(64)         NOT NULL,
        "expires_at"                    TIMESTAMP                     NOT NULL,
        "used"                          boolean                       NOT NULL DEFAULT false,
        "role"                          "institutional_user_role_enum" NOT NULL DEFAULT 'DOCTOR',
        "documents_ids"                 text[],
        "persistent"                    boolean                       NOT NULL DEFAULT false,
        "allow_access_to_all_documents" boolean                       NOT NULL DEFAULT false,
        CONSTRAINT "PK_dv_patient_access_code"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_dv_patient_access_code_code"  UNIQUE ("code"),
        CONSTRAINT "FK_dv_patient_access_code_patient"
          FOREIGN KEY ("patient_id")
          REFERENCES "dv_patient"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_access_code_patient_id"
      ON "dv_patient_access_code" ("patient_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_access_code_expires_at"
      ON "dv_patient_access_code" ("expires_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_access_code_used"
      ON "dv_patient_access_code" ("used")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_access_code_is_active"
      ON "dv_patient_access_code" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_access_code_role"
      ON "dv_patient_access_code" ("role")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_access_code_role"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_access_code_is_active"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_access_code_used"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_access_code_expires_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_access_code_patient_id"`,
    );
    await queryRunner.query(`DROP TABLE "dv_patient_access_code"`);
    await queryRunner.query(`DROP TYPE "institutional_user_role_enum"`);
  }
}
