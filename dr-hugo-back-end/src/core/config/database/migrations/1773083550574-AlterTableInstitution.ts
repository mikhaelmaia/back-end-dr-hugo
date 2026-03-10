import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableInstitution1773083550574 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create dv_health_institution table to store CNES health-specific data
    await queryRunner.query(`
            CREATE TABLE "dv_health_institution" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "institution_id" uuid NOT NULL,
                "organization_nature" VARCHAR(255),
                "legal_nature_description" VARCHAR(50),
                "disabling_reason_code" VARCHAR(50),
                "has_surgical_center" BOOLEAN,
                "has_obstetric_center" BOOLEAN,
                "has_neonatal_center" BOOLEAN,
                "has_hospital_care" BOOLEAN,
                "has_support_service" BOOLEAN,
                "has_outpatient_care" BOOLEAN,
                "teaching_activity_code" VARCHAR(10),
                "unit_organization_nature_code" VARCHAR(50),
                "unit_hierarchy_level_code" VARCHAR(50),
                "unit_administrative_sphere_code" VARCHAR(10),
                "last_update_date" DATE,
                CONSTRAINT "PK_health_institution" PRIMARY KEY ("id"),
                CONSTRAINT "FK_health_institution_institution" 
                    FOREIGN KEY ("institution_id") REFERENCES "dv_institution"("id") ON DELETE CASCADE,
                CONSTRAINT "UQ_health_institution_institution" 
                    UNIQUE ("institution_id")
            )
        `);

    // Create index on institution_id for performance
    await queryRunner.query(`
            CREATE INDEX "IDX_health_institution_institution_id" 
            ON "dv_health_institution"("institution_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the health institution table
    await queryRunner.query(`DROP TABLE IF EXISTS "dv_health_institution"`);
  }
}
