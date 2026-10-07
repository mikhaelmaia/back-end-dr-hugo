import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMainEntityTables1769200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ENUMs ───────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('ADMIN', 'PATIENT', 'DOCTOR', 'INSTITUTION')
    `);

    await queryRunner.query(`
      CREATE TYPE "doctor_situation_enum" AS ENUM(
        'Regular', 'Suspensão parcial permanente', 'Cassado', 'Inoperante',
        'Falecido', 'Sem exercício UF', 'Interdição cautelar total',
        'Suspenso ordem judicial parcial', 'Cancelado', 'Suspensão total temporária',
        'Interdição cautelar parcial', 'Suspenso ordem judicial total', 'Aposentado',
        'Suspensão temporária', 'Suspenso total', 'Transferido', 'Suspenso parcial'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "doctor_registration_type_enum" AS ENUM(
        'Principal', 'Secundária', 'Provisória', 'Temporária', 'Estudante estrangeiro'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "doctor_specialization_type_enum" AS ENUM(
        'Acupuntura', 'Alergia e imunologia', 'Anestesiologia', 'Angiologia',
        'Cardiologia', 'Cirurgia cardiovascular', 'Cirurgia da mão',
        'Cirurgia de cabeça e pescoço', 'Cirurgia do aparelho digestivo',
        'Cirurgia geral', 'Cirurgia oncológica', 'Cirurgia pediátrica',
        'Cirurgia plástica', 'Cirurgia torácica', 'Cirurgia vascular',
        'Clínica médica', 'Coloproctologia', 'Dermatologia',
        'Endocrinologia e metabologia', 'Endoscopia', 'Gastroenterologia',
        'Genética médica', 'Geriatria', 'Ginecologia e obstetrícia',
        'Hematologia e hemoterapia', 'Homeopatia', 'Infectologia', 'Mastologia',
        'Medicina de emergência', 'Medicina de família e comunidade',
        'Medicina do trabalho', 'Medicina do tráfego', 'Medicina esportiva',
        'Medicina física e reabilitação', 'Medicina intensiva',
        'Medicina legal e perícia médica', 'Medicina nuclear',
        'Medicina preventiva e social', 'Nefrologia', 'Neurocirurgia', 'Neurologia',
        'Nutrologia', 'Oftalmologia', 'Oncologia clínica',
        'Ortopedia e traumatologia', 'Otorrinolaringologia', 'Patologia',
        'Patologia clínica/medicina laboratorial', 'Pediatria', 'Pneumologia',
        'Psiquiatria', 'Radiologia e diagnóstico por imagem', 'Radioterapia',
        'Reumatologia', 'Urologia'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "medical_institution_type_enum" AS ENUM(
        'Consultório / Clínica', 'Atenção Primária', 'Hospital Geral',
        'Hospital Especializado', 'Urgência / Emergência', 'Diagnóstico por Imagem',
        'Laboratório', 'SADT / Diagnose e Terapia', 'Bancos / Hemoterapia',
        'Domiciliar', 'Regulação / Gestão / Administrativo', 'Perícia', 'Outros'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "company_type_enum" AS ENUM('Matriz', 'Filial')
    `);

    await queryRunner.query(`
      CREATE TYPE "user_change_request_type_enum" AS ENUM('EMAIL', 'PHONE')
    `);

    await queryRunner.query(`
      CREATE TYPE "user_change_request_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'EXPIRED')
    `);

    // ─── dv_user ──────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_user" (
        "id"               uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"        boolean                NOT NULL DEFAULT true,
        "created_at"       TIMESTAMP              NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP,
        "deleted_at"       TIMESTAMP,
        "name"             character varying(100) NOT NULL,
        "email"            text                   NOT NULL,
        "email_hash"       character varying(64)  NOT NULL,
        "password"         character varying(255) NOT NULL,
        "tax_id"           text                   NOT NULL,
        "tax_id_hash"      character varying(64)  NOT NULL,
        "phone"            text                   NOT NULL,
        "phone_hash"       character varying(64)  NOT NULL,
        "country_code"     character varying(3)   NOT NULL,
        "country_idd"      character varying(5)   NOT NULL,
        "is_valid"         boolean                NOT NULL DEFAULT false,
        "role"             "user_role_enum"        NOT NULL DEFAULT 'PATIENT',
        "accepted_terms"   jsonb                  NOT NULL,
        "api_key"          text                   NOT NULL,
        "api_key_hash"     character varying(64)  NOT NULL,
        "profile_picture_id" uuid,
        CONSTRAINT "PK_dv_user"                  PRIMARY KEY ("id"),
        CONSTRAINT "UQ_dv_user_email_hash_role"   UNIQUE ("email_hash", "role"),
        CONSTRAINT "UQ_dv_user_tax_id_hash_role"  UNIQUE ("tax_id_hash", "role"),
        CONSTRAINT "UQ_dv_user_phone_hash_role"   UNIQUE ("phone_hash", "role"),
        CONSTRAINT "UQ_dv_user_api_key_hash"      UNIQUE ("api_key_hash"),
        CONSTRAINT "FK_dv_user_profile_picture"
          FOREIGN KEY ("profile_picture_id")
          REFERENCES "dv_media"("id")
          ON DELETE SET NULL
      )
    `);

    // ─── dv_patient ───────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_patient" (
        "id"         uuid            NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"  boolean         NOT NULL DEFAULT true,
        "created_at" TIMESTAMP       NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP,
        "deleted_at" TIMESTAMP,
        "user_id"    uuid            NOT NULL,
        "birth_date" date            NOT NULL,
        "gender"     VARCHAR(10)     NOT NULL DEFAULT 'Outro',
        CONSTRAINT "PK_dv_patient" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_patient_user"
          FOREIGN KEY ("user_id")
          REFERENCES "dv_user"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_user_id" ON "dv_patient" ("user_id")
    `);

    // ─── dv_doctor_registration ───────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_doctor_registration" (
        "id"          uuid                            NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"   boolean                         NOT NULL DEFAULT true,
        "created_at"  TIMESTAMP                       NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP,
        "deleted_at"  TIMESTAMP,
        "crm"         character varying(20)           NOT NULL,
        "situation"   "doctor_situation_enum"         NOT NULL,
        "type"        "doctor_registration_type_enum" NOT NULL,
        "last_update" TIMESTAMP                       NOT NULL,
        "state"       "brazilian_state_enum"          NOT NULL,
        CONSTRAINT "PK_dv_doctor_registration"        PRIMARY KEY ("id"),
        CONSTRAINT "UQ_dv_doctor_registration_crm"    UNIQUE ("crm")
      )
    `);

    // ─── dv_doctor ────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_doctor" (
        "id"              uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"       boolean     NOT NULL DEFAULT true,
        "created_at"      TIMESTAMP   NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP,
        "deleted_at"      TIMESTAMP,
        "user_id"         uuid        NOT NULL,
        "registration_id" uuid        NOT NULL,
        "is_generalist"   boolean     NOT NULL DEFAULT false,
        "birth_date"      date        NOT NULL,
        "gender"          VARCHAR(10) NOT NULL DEFAULT 'Outro',
        CONSTRAINT "PK_dv_doctor" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_doctor_user"
          FOREIGN KEY ("user_id")
          REFERENCES "dv_user"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_dv_doctor_registration"
          FOREIGN KEY ("registration_id")
          REFERENCES "dv_doctor_registration"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_doctor_user_id" ON "dv_doctor" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_doctor_registration_id" ON "dv_doctor" ("registration_id")
    `);

    // ─── dv_doctor_specialization ─────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_doctor_specialization" (
        "id"        uuid                              NOT NULL DEFAULT uuid_generate_v4(),
        "is_active" boolean                           NOT NULL DEFAULT true,
        "created_at" TIMESTAMP                        NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP,
        "deleted_at" TIMESTAMP,
        "doctor_id" uuid                              NOT NULL,
        "name"      "doctor_specialization_type_enum" NOT NULL,
        "rqe"       character varying(20)             NOT NULL,
        CONSTRAINT "PK_dv_doctor_specialization" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_doctor_specialization_doctor"
          FOREIGN KEY ("doctor_id")
          REFERENCES "dv_doctor"("id")
          ON DELETE CASCADE
      )
    `);

    // ─── dv_institution_company_representative ────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_institution_company_representative" (
        "id"         uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"  boolean                NOT NULL DEFAULT true,
        "created_at" TIMESTAMP              NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP,
        "deleted_at" TIMESTAMP,
        "name"       text                   NOT NULL,
        "tax_id"     text                   NOT NULL,
        "crm"        character varying(20)  NOT NULL,
        "state"      "brazilian_state_enum" NOT NULL,
        CONSTRAINT "PK_dv_institution_company_representative" PRIMARY KEY ("id")
      )
    `);

    // ─── dv_institution ───────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_institution" (
        "id"                           uuid                            NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"                    boolean                         NOT NULL DEFAULT true,
        "created_at"                   TIMESTAMP                       NOT NULL DEFAULT now(),
        "updated_at"                   TIMESTAMP,
        "deleted_at"                   TIMESTAMP,
        "user_id"                      uuid                            NOT NULL,
        "address_id"                   uuid                            NOT NULL,
        "cnes"                         character varying(7),
        "medical_institution_type"     "medical_institution_type_enum" NOT NULL,
        "other_medical_institution_type" character varying(255),
        CONSTRAINT "PK_dv_institution" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_institution_user"
          FOREIGN KEY ("user_id")
          REFERENCES "dv_user"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_dv_institution_address"
          FOREIGN KEY ("address_id")
          REFERENCES "dv_address"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_institution_user_id" ON "dv_institution" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_institution_address_id" ON "dv_institution" ("address_id")
    `);

    // ─── dv_institution_company ───────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_institution_company" (
        "id"                               uuid                   NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"                        boolean                NOT NULL DEFAULT true,
        "created_at"                       TIMESTAMP              NOT NULL DEFAULT now(),
        "updated_at"                       TIMESTAMP,
        "deleted_at"                       TIMESTAMP,
        "institution_id"                   uuid                   NOT NULL,
        "representative_id"                uuid                   NOT NULL,
        "type"                             "company_type_enum"    NOT NULL,
        "size"                             character varying(255) NOT NULL,
        "name"                             character varying(255) NOT NULL,
        "fantasy_name"                     character varying(255),
        "main_activities"                  json,
        "secondary_activities"             json,
        "legal_nature"                     character varying(255),
        "legal_representative_name"        character varying(255),
        "legal_representative_qualification" character varying(255),
        CONSTRAINT "PK_dv_institution_company" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_institution_company_institution"
          FOREIGN KEY ("institution_id")
          REFERENCES "dv_institution"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_dv_institution_company_representative"
          FOREIGN KEY ("representative_id")
          REFERENCES "dv_institution_company_representative"("id")
          ON DELETE CASCADE
      )
    `);

    // ─── dv_health_institution ────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_health_institution" (
        "id"                              uuid            NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"                       boolean         NOT NULL DEFAULT true,
        "created_at"                      TIMESTAMP       NOT NULL DEFAULT now(),
        "updated_at"                      TIMESTAMP,
        "deleted_at"                      TIMESTAMP,
        "institution_id"                  uuid            NOT NULL,
        "organization_nature"             VARCHAR(255),
        "legal_nature_description"        VARCHAR(50),
        "disabling_reason_code"           VARCHAR(50),
        "has_surgical_center"             BOOLEAN,
        "has_obstetric_center"            BOOLEAN,
        "has_neonatal_center"             BOOLEAN,
        "has_hospital_care"               BOOLEAN,
        "has_support_service"             BOOLEAN,
        "has_outpatient_care"             BOOLEAN,
        "teaching_activity_code"          VARCHAR(10),
        "unit_organization_nature_code"   VARCHAR(50),
        "unit_hierarchy_level_code"       VARCHAR(50),
        "unit_administrative_sphere_code" VARCHAR(10),
        "last_update_date"                DATE,
        CONSTRAINT "PK_health_institution" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_health_institution_institution" UNIQUE ("institution_id"),
        CONSTRAINT "FK_health_institution_institution"
          FOREIGN KEY ("institution_id")
          REFERENCES "dv_institution"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_health_institution_institution_id"
      ON "dv_health_institution"("institution_id")
    `);

    // ─── dv_user_change_request ───────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_user_change_request" (
        "id"               uuid                               NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"        boolean                            NOT NULL DEFAULT true,
        "created_at"       TIMESTAMP                          NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP                          DEFAULT now(),
        "deleted_at"       TIMESTAMP,
        "user_id"          uuid                               NOT NULL,
        "type"             "user_change_request_type_enum"    NOT NULL,
        "new_value"        text                               NOT NULL,
        "new_country_code" character varying(3),
        "new_country_idd"  character varying(5),
        "expires_at"       TIMESTAMP                          NOT NULL,
        "status"           "user_change_request_status_enum"  NOT NULL DEFAULT 'PENDING',
        CONSTRAINT "PK_dv_user_change_request" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_user_change_request_user"
          FOREIGN KEY ("user_id")
          REFERENCES "dv_user"("id")
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
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

    // ─── Deferred FK: dv_audit.author_id → dv_user ───────────────────────────

    await queryRunner.query(`
      ALTER TABLE "dv_audit"
      ADD CONSTRAINT "FK_dv_audit_author"
        FOREIGN KEY ("author_id")
        REFERENCES "dv_user"("id")
        ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "dv_audit" DROP CONSTRAINT "FK_dv_audit_author"`,
    );

    await queryRunner.query(
      `DROP INDEX "IDX_dv_user_change_request_expires_at"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_user_change_request_status"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dv_user_change_request_is_active"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_user_change_request_user_id"`);
    await queryRunner.query(`DROP TABLE "dv_user_change_request"`);

    await queryRunner.query(
      `DROP INDEX "IDX_health_institution_institution_id"`,
    );
    await queryRunner.query(`DROP TABLE "dv_health_institution"`);

    await queryRunner.query(`DROP TABLE "dv_institution_company"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_institution_address_id"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_institution_user_id"`);
    await queryRunner.query(`DROP TABLE "dv_institution"`);
    await queryRunner.query(
      `DROP TABLE "dv_institution_company_representative"`,
    );
    await queryRunner.query(`DROP TABLE "dv_doctor_specialization"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_doctor_registration_id"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_doctor_user_id"`);
    await queryRunner.query(`DROP TABLE "dv_doctor"`);
    await queryRunner.query(`DROP TABLE "dv_doctor_registration"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_user_id"`);
    await queryRunner.query(`DROP TABLE "dv_patient"`);
    await queryRunner.query(`DROP TABLE "dv_user"`);

    await queryRunner.query(`DROP TYPE "user_change_request_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_change_request_type_enum"`);
    await queryRunner.query(`DROP TYPE "company_type_enum"`);
    await queryRunner.query(`DROP TYPE "medical_institution_type_enum"`);
    await queryRunner.query(`DROP TYPE "doctor_specialization_type_enum"`);
    await queryRunner.query(`DROP TYPE "doctor_registration_type_enum"`);
    await queryRunner.query(`DROP TYPE "doctor_situation_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
