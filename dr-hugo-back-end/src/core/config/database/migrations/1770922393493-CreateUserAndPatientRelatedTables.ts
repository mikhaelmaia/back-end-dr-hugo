import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndPatientRelatedTables1770922393493 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "user_change_request_type_enum" AS ENUM('EMAIL', 'PHONE')
        `);

    await queryRunner.query(`
            CREATE TYPE "user_change_request_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'EXPIRED')
        `);

    await queryRunner.query(`
            CREATE TABLE "dv_user_change_request" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "type" "user_change_request_type_enum" NOT NULL,
                "new_value" character varying(100) NOT NULL,
                "new_country_code" character varying(3),
                "new_country_idd" character varying(5),
                "expires_at" TIMESTAMP NOT NULL,
                "status" "user_change_request_status_enum" NOT NULL DEFAULT 'PENDING',
                CONSTRAINT "PK_dv_user_change_request" PRIMARY KEY ("id"),
                CONSTRAINT "FK_dv_user_change_request_user" FOREIGN KEY ("user_id") REFERENCES "dv_user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_user_change_request_user_id" ON "dv_user_change_request" ("user_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_user_change_request_is_active" ON "dv_user_change_request" ("is_active")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_user_change_request_status" ON "dv_user_change_request" ("status")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_user_change_request_expires_at" ON "dv_user_change_request" ("expires_at")
        `);

    await queryRunner.query(`
        CREATE TABLE "dv_patient_access_code" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP DEFAULT now(),
            "deleted_at" TIMESTAMP,
            "patient_id" uuid NOT NULL,
            "code" character varying(64) NOT NULL,
            "expires_at" TIMESTAMP NOT NULL,
            "used" boolean NOT NULL DEFAULT false,
            "used_at" TIMESTAMP,
            CONSTRAINT "PK_dv_patient_access_code" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_dv_patient_access_code_code" UNIQUE ("code"),
            CONSTRAINT "FK_dv_patient_access_code_patient"
              FOREIGN KEY ("patient_id")
              REFERENCES "dv_patient" ("id")
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
        CREATE TYPE "patient_document_type_enum" AS ENUM(
            'LABORATORY_EXAM',
            'IMAGING_EXAM',
            'PRESCRIPTION',
            'MEDICAL_CERTIFICATE',
            'MEDICAL_REPORT',
            'EXAM_REQUEST',
            'MEDICAL_RECORD',
            'VACCINATION_CARD',
            'OTHER'
        )
    `);

    await queryRunner.query(`
        CREATE TABLE "dv_patient_document" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP DEFAULT now(),
            "deleted_at" TIMESTAMP,

            "description" character varying(255) NOT NULL,
            "type" "patient_document_type_enum" NOT NULL,
            "exam_date" DATE NOT NULL,
            "exam_month" DATE NOT NULL,
            "requester_name" character varying(255),
            "exam_location" character varying(255),
            "observations" text,

            "patient_id" uuid NOT NULL,
            "media_id" uuid NOT NULL,

            CONSTRAINT "PK_dv_patient_document" PRIMARY KEY ("id"),

            CONSTRAINT "FK_dv_patient_document_patient"
            FOREIGN KEY ("patient_id")
            REFERENCES "dv_patient" ("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION,

            CONSTRAINT "FK_dv_patient_document_media"
            FOREIGN KEY ("media_id")
            REFERENCES "dv_media" ("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        )
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_dv_patient_document_patient_id"
        ON "dv_patient_document" ("patient_id")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_dv_patient_document_exam_month"
        ON "dv_patient_document" ("exam_month")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_dv_patient_document_type"
        ON "dv_patient_document" ("type")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_dv_patient_document_is_active"
        ON "dv_patient_document" ("is_active")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_dv_patient_document_deleted_at"
        ON "dv_patient_document" ("deleted_at")
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_dv_patient_document_patient_month"
        ON "dv_patient_document" ("patient_id", "exam_month")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_dv_user_change_request_expires_at"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_user_change_request_status"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dv_user_change_request_is_active"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_user_change_request_user_id"`);
    await queryRunner.query(`DROP TABLE "dv_user_change_request"`);
    await queryRunner.query(`DROP TYPE "user_change_request_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_change_request_type_enum"`);

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

    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_patient_month"`,
    );

    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_deleted_at"`);

    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_is_active"`);

    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_type"`);

    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_exam_month"`);

    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_patient_id"`);

    await queryRunner.query(`DROP TABLE "dv_patient_document"`);

    await queryRunner.query(`DROP TYPE "patient_document_type_enum"`);
  }
}
