import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterPatientMedicalRecordTable1771422582449 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            ADD COLUMN "physical_activity_types" text
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            ADD COLUMN "weekly_frequency" varchar(50)
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            ALTER COLUMN "cigarettes_per_day" TYPE varchar(50) USING cigarettes_per_day::varchar
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            ALTER COLUMN "years_smoking" TYPE varchar(50) USING years_smoking::varchar
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            DROP COLUMN "physical_activity_description"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            ADD COLUMN "physical_activity_description" text
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            DROP COLUMN "weekly_frequency"
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            DROP COLUMN "physical_activity_types"
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            ALTER COLUMN "cigarettes_per_day" TYPE integer USING cigarettes_per_day::integer
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_medical_record" 
            ALTER COLUMN "years_smoking" TYPE integer USING years_smoking::integer
        `);
  }
}
