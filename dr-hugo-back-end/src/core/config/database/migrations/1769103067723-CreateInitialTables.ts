import { MigrationInterface, QueryRunner } from 'typeorm';

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
            CREATE TYPE "brazilian_state_enum" AS ENUM('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO')
        `);

    await queryRunner.query(`
            CREATE TYPE "doctor_situation_enum" AS ENUM('Regular', 'Suspensão parcial permanente', 'Cassado', 'Inoperante', 'Falecido', 'Sem exercício UF', 'Interdição cautelar total', 'Suspenso ordem judicial parcial', 'Cancelado', 'Suspensão total temporária', 'Interdição cautelar parcial', 'Suspenso ordem judicial total', 'Aposentado', 'Suspensão temporária', 'Suspenso total', 'Transferido', 'Suspenso parcial')
        `);

    await queryRunner.query(`
            CREATE TYPE "doctor_registration_type_enum" AS ENUM('Principal', 'Secundária', 'Provisória', 'Temporária', 'Estudante estrangeiro')
        `);

    await queryRunner.query(`
            CREATE TYPE "doctor_specialization_type_enum" AS ENUM('Acupuntura', 'Alergia e imunologia', 'Anestesiologia', 'Angiologia', 'Cardiologia', 'Cirurgia cardiovascular', 'Cirurgia da mão', 'Cirurgia de cabeça e pescoço', 'Cirurgia do aparelho digestivo', 'Cirurgia geral', 'Cirurgia oncológica', 'Cirurgia pediátrica', 'Cirurgia plástica', 'Cirurgia torácica', 'Cirurgia vascular', 'Clínica médica', 'Coloproctologia', 'Dermatologia', 'Endocrinologia e metabologia', 'Endoscopia', 'Gastroenterologia', 'Genética médica', 'Geriatria', 'Ginecologia e obstetrícia', 'Hematologia e hemoterapia', 'Homeopatia', 'Infectologia', 'Mastologia', 'Medicina de emergência', 'Medicina de família e comunidade', 'Medicina do trabalho', 'Medicina do tráfego', 'Medicina esportiva', 'Medicina física e reabilitação', 'Medicina intensiva', 'Medicina legal e perícia médica', 'Medicina nuclear', 'Medicina preventiva e social', 'Nefrologia', 'Neurocirurgia', 'Neurologia', 'Nutrologia', 'Oftalmologia', 'Oncologia clínica', 'Ortopedia e traumatologia', 'Otorrinolaringologia', 'Patologia', 'Patologia clínica/medicina laboratorial', 'Pediatria', 'Pneumologia', 'Psiquiatria', 'Radiologia e diagnóstico por imagem', 'Radioterapia', 'Reumatologia', 'Urologia')
        `);

    await queryRunner.query(`
            CREATE TYPE "medical_institution_type_enum" AS ENUM('Consultório / Clínica', 'Atenção Primária', 'Hospital Geral', 'Hospital Especializado', 'Urgência / Emergência', 'Diagnóstico por Imagem', 'Laboratório', 'SADT / Diagnose e Terapia', 'Bancos / Hemoterapia', 'Domiciliar', 'Regulação / Gestão / Administrativo', 'Perícia', 'Outros')
        `);

    await queryRunner.query(`
            CREATE TYPE "company_type_enum" AS ENUM('Matriz', 'Filial')
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
                "taxId" character varying(14) NOT NULL,
                "phone" character varying(15) NOT NULL,
                "country_code" character varying(3) NOT NULL,
                "country_idd" character varying(5) NOT NULL,
                "is_valid" boolean NOT NULL DEFAULT false,
                "role" "user_role_enum" NOT NULL DEFAULT 'PATIENT',
                "accepted_terms" jsonb NOT NULL,
                "profile_picture_id" uuid,
                CONSTRAINT "PK_dv_user" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_dv_user_email_role" UNIQUE ("email", "role"),
                CONSTRAINT "UQ_dv_user_taxId_role" UNIQUE ("taxId", "role"),
                CONSTRAINT "UQ_dv_user_phone_role" UNIQUE ("phone", "role")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "dv_address" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "street" character varying(255) NOT NULL,
                "number" character varying(20) NOT NULL,
                "complement" character varying(100),
                "neighborhood" character varying(100) NOT NULL,
                "city" character varying(100) NOT NULL,
                "state" "brazilian_state_enum" NOT NULL,
                "zip_code" character varying(8) NOT NULL,
                "country" character varying(100) NOT NULL DEFAULT 'Brasil',
                CONSTRAINT "PK_dv_address" PRIMARY KEY ("id")
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
            CREATE TABLE "dv_doctor_registration" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "crm" character varying(20) NOT NULL,
                "situation" "doctor_situation_enum" NOT NULL,
                "type" "doctor_registration_type_enum" NOT NULL,
                "last_update" TIMESTAMP NOT NULL,
                "state" "brazilian_state_enum" NOT NULL,
                CONSTRAINT "PK_dv_doctor_registration" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_dv_doctor_registration_crm" UNIQUE ("crm")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "dv_doctor" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "registration_id" uuid NOT NULL,
                "is_generalist" boolean NOT NULL DEFAULT false,
                "birth_date" date NOT NULL,
                CONSTRAINT "PK_dv_doctor" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "dv_doctor_specialization" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "doctor_id" uuid NOT NULL,
                "name" "doctor_specialization_type_enum" NOT NULL,
                "rqe" character varying(20) NOT NULL,
                CONSTRAINT "PK_dv_doctor_specialization" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "dv_institution_company_representative" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "name" character varying(255) NOT NULL,
                "tax_id" character varying(14) NOT NULL,
                "crm" character varying(20) NOT NULL,
                "state" "brazilian_state_enum" NOT NULL,
                CONSTRAINT "PK_dv_institution_company_representative" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "dv_institution_company" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "institution_id" uuid NOT NULL,
                "representative_id" uuid NOT NULL,
                "type" "company_type_enum" NOT NULL,
                "size" character varying(255) NOT NULL,
                "name" character varying(255) NOT NULL,
                "fantasy_name" character varying(255),
                "main_activities" json,
                "secondary_activities" json,
                "legal_nature" character varying(255),
                "legal_representative_name" character varying(255),
                "legal_representative_qualification" character varying(255),
                CONSTRAINT "PK_dv_institution_company" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "dv_institution" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP,
                "deleted_at" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "address_id" uuid NOT NULL,
                "cnes" character varying(7),
                "medical_institution_type" "medical_institution_type_enum" NOT NULL,
                "other_medical_institution_type" character varying(255),
                CONSTRAINT "PK_dv_institution" PRIMARY KEY ("id")
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
            ALTER TABLE "dv_doctor" ADD CONSTRAINT "FK_dv_doctor_user" 
            FOREIGN KEY ("user_id") REFERENCES "dv_user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_doctor" ADD CONSTRAINT "FK_dv_doctor_registration" 
            FOREIGN KEY ("registration_id") REFERENCES "dv_doctor_registration"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_doctor_specialization" ADD CONSTRAINT "FK_dv_doctor_specialization_doctor" 
            FOREIGN KEY ("doctor_id") REFERENCES "dv_doctor"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_institution" ADD CONSTRAINT "FK_dv_institution_user" 
            FOREIGN KEY ("user_id") REFERENCES "dv_user"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_institution" ADD CONSTRAINT "FK_dv_institution_address" 
            FOREIGN KEY ("address_id") REFERENCES "dv_address"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_institution_company" ADD CONSTRAINT "FK_dv_institution_company_institution" 
            FOREIGN KEY ("institution_id") REFERENCES "dv_institution"("id") ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_institution_company" ADD CONSTRAINT "FK_dv_institution_company_representative" 
            FOREIGN KEY ("representative_id") REFERENCES "dv_institution_company_representative"("id") ON DELETE CASCADE
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
    await queryRunner.query(
      `ALTER TABLE "dv_audit" DROP CONSTRAINT "FK_dv_audit_fingerprint"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_audit" DROP CONSTRAINT "FK_dv_audit_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_institution_company" DROP CONSTRAINT "FK_dv_institution_company_representative"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_institution_company" DROP CONSTRAINT "FK_dv_institution_company_institution"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_institution" DROP CONSTRAINT "FK_dv_institution_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_institution" DROP CONSTRAINT "FK_dv_institution_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_doctor_specialization" DROP CONSTRAINT "FK_dv_doctor_specialization_doctor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_doctor" DROP CONSTRAINT "FK_dv_doctor_registration"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_doctor" DROP CONSTRAINT "FK_dv_doctor_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_patient" DROP CONSTRAINT "FK_dv_patient_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dv_user" DROP CONSTRAINT "FK_dv_user_profile_picture"`,
    );

    await queryRunner.query(
      `DROP INDEX "IDX_dv_token_identification_type_times"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_token_expiration_time"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_token_renewal_time"`);

    await queryRunner.query(`DROP TABLE "dv_audit"`);
    await queryRunner.query(`DROP TABLE "dv_audit_fingerprint"`);
    await queryRunner.query(`DROP TABLE "dv_token"`);
    await queryRunner.query(`DROP TABLE "dv_institution"`);
    await queryRunner.query(`DROP TABLE "dv_institution_company"`);
    await queryRunner.query(
      `DROP TABLE "dv_institution_company_representative"`,
    );
    await queryRunner.query(`DROP TABLE "dv_doctor_specialization"`);
    await queryRunner.query(`DROP TABLE "dv_doctor"`);
    await queryRunner.query(`DROP TABLE "dv_doctor_registration"`);
    await queryRunner.query(`DROP TABLE "dv_patient"`);
    await queryRunner.query(`DROP TABLE "dv_address"`);
    await queryRunner.query(`DROP TABLE "dv_user"`);
    await queryRunner.query(`DROP TABLE "dv_media"`);

    await queryRunner.query(`DROP TYPE "company_type_enum"`);
    await queryRunner.query(`DROP TYPE "medical_institution_type_enum"`);
    await queryRunner.query(`DROP TYPE "doctor_specialization_type_enum"`);
    await queryRunner.query(`DROP TYPE "doctor_registration_type_enum"`);
    await queryRunner.query(`DROP TYPE "doctor_situation_enum"`);
    await queryRunner.query(`DROP TYPE "brazilian_state_enum"`);
    await queryRunner.query(`DROP TYPE "audit_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "media_type_enum"`);
    await queryRunner.query(`DROP TYPE "token_type_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
