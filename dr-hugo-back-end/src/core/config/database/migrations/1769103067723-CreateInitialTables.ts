import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1769103067723 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM('ADMIN', 'PATIENT', 'DOCTOR', 'INSTITUTION')
        `);

        await queryRunner.query(`
            CREATE TYPE "token_type_enum" AS ENUM('PASSWORD_RESET', 'EMAIL_CONFIRMATION')
        `);

        await queryRunner.query(`
            CREATE TYPE "media_type_enum" AS ENUM('PNG', 'JPG', 'JPEG', 'GIF', 'PDF', 'DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT', 'TXT', 'HTML')
        `);

        await queryRunner.query(`
            CREATE TYPE "audit_event_type_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE')
        `);

        await queryRunner.query(`
            CREATE TABLE "dv_media" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "filename" character varying(255) NOT NULL,
                "type" "media_type_enum" NOT NULL,
                "size" integer NOT NULL,
                "bucket" character varying(100) NOT NULL,
                "object_name" character varying(500) NOT NULL,
                CONSTRAINT "PK_dv_media" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "dv_user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "name" character varying(100) NOT NULL,
                "email" character varying(50) NOT NULL,
                "password" character varying(255) NOT NULL,
                "taxId" character varying(17) NOT NULL,
                "phone" character varying(15) NOT NULL,
                "country_code" character varying(3) NOT NULL,
                "country_idd" character varying(5) NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'PATIENT',
                "accepted_terms" jsonb NOT NULL,
                "profile_picture_id" uuid,
                CONSTRAINT "PK_dv_user" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_dv_user_taxId" UNIQUE ("taxId"),
                CONSTRAINT "UQ_dv_user_email" UNIQUE ("email"),
                CONSTRAINT "UQ_dv_user_phone" UNIQUE ("phone")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "dv_patient" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "birth_date" date NOT NULL,
                CONSTRAINT "PK_dv_patient" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "dv_token" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "token" character varying(6) NOT NULL,
                "hash" character varying(50) NOT NULL,
                "type" "token_type_enum" NOT NULL,
                "identification" character varying(255) NOT NULL,
                "renewal_time" TIMESTAMP NOT NULL,
                "expiration_time" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_dv_token" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_dv_token_token" UNIQUE ("token"),
                CONSTRAINT "UQ_dv_token_hash" UNIQUE ("hash")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_dv_token_renewal_time" ON "dv_token" ("renewal_time")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_dv_token_expiration_time" ON "dv_token" ("expiration_time")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_dv_token_identification_type_times" ON "dv_token" ("identification", "type", "renewal_time", "expiration_time")
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "dv_token"."renewal_time" IS 'Data e hora em que o token pode ser renovado'
        `);

        await queryRunner.query(`
            COMMENT ON COLUMN "dv_token"."expiration_time" IS 'Data e hora em que o token expira definitivamente'
        `);

        await queryRunner.query(`
            CREATE TABLE "dv_audit_fingerprint" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "fingerprint_hash" character varying(64) NOT NULL,
                "ip_address" character varying(45) NOT NULL,
                "user_agent" text NOT NULL,
                "session_id" character varying,
                "version" character varying(20) NOT NULL DEFAULT 'unknown',
                CONSTRAINT "PK_dv_audit_fingerprint" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_dv_audit_fingerprint_hash" UNIQUE ("fingerprint_hash")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "dv_audit" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "event_type" "audit_event_type_enum" NOT NULL,
                "entity_name" character varying NOT NULL,
                "entity_id" character varying NOT NULL,
                "data" jsonb NOT NULL,
                "author_id" uuid,
                "fingerprint_id" uuid NOT NULL,
                CONSTRAINT "PK_dv_audit" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "dv_user" ADD CONSTRAINT "FK_dv_user_profile_picture" 
            FOREIGN KEY ("profile_picture_id") REFERENCES "dv_media"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "dv_patient" ADD CONSTRAINT "FK_dv_patient_user" 
            FOREIGN KEY ("user_id") REFERENCES "dv_user"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "dv_audit" ADD CONSTRAINT "FK_dv_audit_author" 
            FOREIGN KEY ("author_id") REFERENCES "dv_user"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "dv_audit" ADD CONSTRAINT "FK_dv_audit_fingerprint" 
            FOREIGN KEY ("fingerprint_id") REFERENCES "dv_audit_fingerprint"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "dv_audit" DROP CONSTRAINT "FK_dv_audit_fingerprint"`);
        await queryRunner.query(`ALTER TABLE "dv_audit" DROP CONSTRAINT "FK_dv_audit_author"`);
        await queryRunner.query(`ALTER TABLE "dv_patient" DROP CONSTRAINT "FK_dv_patient_user"`);
        await queryRunner.query(`ALTER TABLE "dv_user" DROP CONSTRAINT "FK_dv_user_profile_picture"`);

        await queryRunner.query(`DROP INDEX "IDX_dv_token_identification_type_times"`);
        await queryRunner.query(`DROP INDEX "IDX_dv_token_expiration_time"`);
        await queryRunner.query(`DROP INDEX "IDX_dv_token_renewal_time"`);

        await queryRunner.query(`DROP TABLE "dv_audit"`);
        await queryRunner.query(`DROP TABLE "dv_audit_fingerprint"`);
        await queryRunner.query(`DROP TABLE "dv_token"`);
        await queryRunner.query(`DROP TABLE "dv_patient"`);
        await queryRunner.query(`DROP TABLE "dv_user"`);
        await queryRunner.query(`DROP TABLE "dv_media"`);

        await queryRunner.query(`DROP TYPE "audit_event_type_enum"`);
        await queryRunner.query(`DROP TYPE "media_type_enum"`);
        await queryRunner.query(`DROP TYPE "token_type_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
