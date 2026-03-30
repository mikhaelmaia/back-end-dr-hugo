import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreDomainTables1769103067723 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ENUMs ───────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TYPE "media_type_enum" AS ENUM(
        'PNG', 'JPG', 'JPEG', 'GIF', 'PDF',
        'DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT', 'TXT', 'HTML'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "audit_event_type_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE')
    `);

    await queryRunner.query(`
      CREATE TYPE "brazilian_state_enum" AS ENUM(
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "token_type_enum" AS ENUM(
        'PASSWORD_RESET', 'EMAIL_CONFIRMATION', 'USER_REQUEST_CHANGE'
      )
    `);

    // ─── dv_media ─────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_media" (
        "id"          uuid                 NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"   boolean              NOT NULL DEFAULT true,
        "created_at"  TIMESTAMP            NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP,
        "deleted_at"  TIMESTAMP,
        "filename"    character varying(255) NOT NULL,
        "type"        "media_type_enum"    NOT NULL,
        "size"        integer              NOT NULL,
        "bucket"      character varying(100) NOT NULL,
        "object_name" character varying(500) NOT NULL,
        "owner_user_id" uuid              NOT NULL,
        CONSTRAINT "PK_dv_media" PRIMARY KEY ("id")
      )
    `);

    // ─── dv_address ───────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_address" (
        "id"           uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"    boolean                NOT NULL DEFAULT true,
        "created_at"   TIMESTAMP              NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP,
        "deleted_at"   TIMESTAMP,
        "street"       text                   NOT NULL,
        "number"       text                   NOT NULL,
        "complement"   text,
        "neighborhood" text                   NOT NULL,
        "city"         text                   NOT NULL,
        "state"        "brazilian_state_enum" NOT NULL,
        "zip_code"     text                   NOT NULL,
        "country"      character varying(100) NOT NULL DEFAULT 'Brasil',
        CONSTRAINT "PK_dv_address" PRIMARY KEY ("id")
      )
    `);

    // ─── dv_token ─────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_token" (
        "id"              uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"       boolean                NOT NULL DEFAULT true,
        "created_at"      TIMESTAMP              NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP,
        "deleted_at"      TIMESTAMP,
        "token"           character varying(6)   NOT NULL,
        "hash"            character varying(50)  NOT NULL,
        "type"            "token_type_enum"      NOT NULL,
        "identification"  character varying(255) NOT NULL,
        "renewal_time"    TIMESTAMP              NOT NULL,
        "expiration_time" TIMESTAMP              NOT NULL,
        CONSTRAINT "PK_dv_token"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_dv_token_token" UNIQUE ("token"),
        CONSTRAINT "UQ_dv_token_hash"  UNIQUE ("hash")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_token_renewal_time" ON "dv_token" ("renewal_time")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_token_expiration_time" ON "dv_token" ("expiration_time")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_token_identification_type_times"
      ON "dv_token" ("identification", "type", "renewal_time", "expiration_time")
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "dv_token"."renewal_time"
      IS 'Data e hora em que o token pode ser renovado'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "dv_token"."expiration_time"
      IS 'Data e hora em que o token expira definitivamente'
    `);

    // ─── dv_audit_fingerprint ─────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_audit_fingerprint" (
        "id"               uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"        boolean                NOT NULL DEFAULT true,
        "created_at"       TIMESTAMP              NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP,
        "deleted_at"       TIMESTAMP,
        "fingerprint_hash" text                   NOT NULL,
        "ip_address"       text                   NOT NULL,
        "user_agent"       text                   NOT NULL,
        "session_id"       character varying,
        "version"          character varying(20)  NOT NULL DEFAULT 'unknown',
        CONSTRAINT "PK_dv_audit_fingerprint"      PRIMARY KEY ("id"),
        CONSTRAINT "UQ_dv_audit_fingerprint_hash" UNIQUE ("fingerprint_hash")
      )
    `);

    // ─── dv_audit ─────────────────────────────────────────────────────────────
    // NOTE: author_id FK to dv_user is added in CreateMainEntityTables migration

    await queryRunner.query(`
      CREATE TABLE "dv_audit" (
        "id"           uuid                 NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"    boolean              NOT NULL DEFAULT true,
        "created_at"   TIMESTAMP            NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP,
        "deleted_at"   TIMESTAMP,
        "event_type"   "audit_event_type_enum" NOT NULL,
        "entity_name"  character varying    NOT NULL,
        "entity_id"    character varying    NOT NULL,
        "data"         jsonb                NOT NULL,
        "author_id"    uuid,
        "fingerprint_id" uuid              NOT NULL,
        CONSTRAINT "PK_dv_audit"           PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_audit_fingerprint"
          FOREIGN KEY ("fingerprint_id")
          REFERENCES "dv_audit_fingerprint"("id")
          ON DELETE CASCADE
      )
    `);

    // ─── dv_tuus_category ─────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_tuus_category" (
        "id"         uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"  boolean                NOT NULL DEFAULT true,
        "created_at" TIMESTAMP              NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP              DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "tuss_code"  character varying(20)  NOT NULL,
        "name"       TEXT                   NOT NULL,
        "category"   character varying(30)  NOT NULL,
        CONSTRAINT "PK_dv_tuus_category"         PRIMARY KEY ("id"),
        CONSTRAINT "UQ_dv_tuus_category_tuss_code" UNIQUE ("tuss_code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_tuus_category_is_active" ON "dv_tuus_category" ("is_active")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_tuus_category_deleted_at" ON "dv_tuus_category" ("deleted_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_tuus_category_category" ON "dv_tuus_category" ("category")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_tuus_category_name" ON "dv_tuus_category" ("name")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_tuus_category_name_lower" ON "dv_tuus_category" (LOWER("name"))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_name_lower"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_name"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_category"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_deleted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_is_active"`);
    await queryRunner.query(`DROP TABLE "dv_tuus_category"`);

    await queryRunner.query(`DROP TABLE "dv_audit"`);
    await queryRunner.query(`DROP TABLE "dv_audit_fingerprint"`);

    await queryRunner.query(`DROP INDEX "IDX_dv_token_identification_type_times"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_token_expiration_time"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_token_renewal_time"`);
    await queryRunner.query(`DROP TABLE "dv_token"`);

    await queryRunner.query(`DROP TABLE "dv_address"`);
    await queryRunner.query(`DROP TABLE "dv_media"`);

    await queryRunner.query(`DROP TYPE "token_type_enum"`);
    await queryRunner.query(`DROP TYPE "brazilian_state_enum"`);
    await queryRunner.query(`DROP TYPE "audit_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "media_type_enum"`);
  }
}
