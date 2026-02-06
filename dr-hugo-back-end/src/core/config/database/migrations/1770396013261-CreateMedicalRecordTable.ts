import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMedicalRecordTable1770396013261 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "dv_patient_medical_record" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "patient_id" uuid NOT NULL,
                "has_allergies" boolean NOT NULL DEFAULT false,
                "allergies_description" text,
                "has_chronic_diseases" boolean NOT NULL DEFAULT false,
                "chronic_diseases_description" text,
                "has_surgeries" boolean NOT NULL DEFAULT false,
                "surgeries_description" text,
                "has_medical_treatment" boolean NOT NULL DEFAULT false,
                "medical_treatment_description" text,
                "has_medications" boolean NOT NULL DEFAULT false,
                "medications_description" text,
                "has_insomnia" boolean NOT NULL DEFAULT false,
                "insomnia_description" text,
                "has_alcohol_use" boolean NOT NULL DEFAULT false,
                "alcohol_description" text,
                "has_physical_activity" boolean NOT NULL DEFAULT false,
                "physical_activity_description" text,
                "blood_pressure" character varying(10),
                "is_smoker" boolean NOT NULL DEFAULT false,
                "cigarettes_per_day" integer,
                "years_smoking" integer,
                "accepted_terms" jsonb NOT NULL,
                CONSTRAINT "PK_dv_patient_medical_record" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_dv_patient_medical_record_patient" UNIQUE ("patient_id"),
                CONSTRAINT "FK_dv_patient_medical_record_patient" FOREIGN KEY ("patient_id") REFERENCES "dv_patient" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_medical_record_patient_id" ON "dv_patient_medical_record" ("patient_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_medical_record_is_active" ON "dv_patient_medical_record" ("is_active")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_medical_record_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_medical_record_patient_id"`,
    );
    await queryRunner.query(`DROP TABLE "dv_patient_medical_record"`);
  }
}
