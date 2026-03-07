import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTuusCategoryTableAndAlterPatientDocument1772480510747 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar tabela dv_tuus_category
    await queryRunner.query(`
            CREATE TABLE "dv_tuus_category" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "tuss_code" character varying(20) NOT NULL,
                "name" TEXT NOT NULL,
                "category" character varying(30) NOT NULL,
                CONSTRAINT "PK_dv_tuus_category" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_dv_tuus_category_tuss_code" UNIQUE ("tuss_code")
            )
        `);

    // Índices para tabela dv_tuus_category
    await queryRunner.query(`
            CREATE INDEX "IDX_dv_tuus_category_is_active"
            ON "dv_tuus_category" ("is_active")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_tuus_category_deleted_at"
            ON "dv_tuus_category" ("deleted_at")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_tuus_category_category"
            ON "dv_tuus_category" ("category")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_tuus_category_name"
            ON "dv_tuus_category" ("name")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_tuus_category_name_lower"
            ON "dv_tuus_category" (LOWER("name"))
        `);

    // 2. Criar tabela dv_patient_document_media
    await queryRunner.query(`
            CREATE TABLE "dv_patient_document_media" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "patient_document_id" uuid NOT NULL,
                "media_id" uuid NOT NULL,
                "is_primary" boolean NOT NULL DEFAULT false,
                "order" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_dv_patient_document_media" PRIMARY KEY ("id"),
                CONSTRAINT "FK_dv_patient_document_media_document"
                FOREIGN KEY ("patient_document_id")
                REFERENCES "dv_patient_document" ("id")
                ON DELETE CASCADE
                ON UPDATE NO ACTION,
                CONSTRAINT "FK_dv_patient_document_media_media"
                FOREIGN KEY ("media_id")
                REFERENCES "dv_media" ("id")
                ON DELETE CASCADE
                ON UPDATE NO ACTION
            )
        `);

    // Índices para tabela dv_patient_document_media
    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_media_document_id"
            ON "dv_patient_document_media" ("patient_document_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_media_media_id"
            ON "dv_patient_document_media" ("media_id")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_media_is_primary"
            ON "dv_patient_document_media" ("is_primary")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_media_order"
            ON "dv_patient_document_media" ("order")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_media_is_active"
            ON "dv_patient_document_media" ("is_active")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_media_deleted_at"
            ON "dv_patient_document_media" ("deleted_at")
        `);

    // 3. Alterar tabela dv_patient_document

    // Remover constraint da FK media_id
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            DROP CONSTRAINT "FK_dv_patient_document_media"
        `);

    // Remover coluna media_id
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            DROP COLUMN "media_id"
        `);

    // Adicionar colunas TUSS
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            ADD COLUMN "tuss_code" character varying(20)
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            ADD COLUMN "tuss_category" character varying(30)
        `);

    // Alterar coluna exam_month para VARCHAR(7) para armazenar formato YYYY-MM
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            ALTER COLUMN "exam_month" TYPE character varying(7)
        `);

    // Alterar enum patient_document_type_enum para usar valores em português
    await queryRunner.query(`
            ALTER TYPE "patient_document_type_enum" RENAME TO "patient_document_type_enum_old"
        `);

    await queryRunner.query(`
            CREATE TYPE "patient_document_type_enum" AS ENUM(
                'Exame Laboratorial/Imagem',
                'Receituário Médico / Prescrição',
                'Atestado / Declaração',
                'Laudo / Relatório Médico',
                'Pedido de Exame / Encaminhamento',
                'Prontuário / Ficha Clínica',
                'Carteira de Vacinação',
                'Outros Documentos'
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            ALTER COLUMN "type" TYPE "patient_document_type_enum"
            USING (
                CASE "type"::text
                    WHEN 'LABORATORY_EXAM' THEN 'Exame Laboratorial/Imagem'
                    WHEN 'IMAGING_EXAM' THEN 'Exame Laboratorial/Imagem'
                    WHEN 'PRESCRIPTION' THEN 'Receituário Médico / Prescrição'
                    WHEN 'MEDICAL_CERTIFICATE' THEN 'Atestado / Declaração'
                    WHEN 'MEDICAL_REPORT' THEN 'Laudo / Relatório Médico'
                    WHEN 'EXAM_REQUEST' THEN 'Pedido de Exame / Encaminhamento'
                    WHEN 'MEDICAL_RECORD' THEN 'Prontuário / Ficha Clínica'
                    WHEN 'VACCINATION_CARD' THEN 'Carteira de Vacinação'
                    WHEN 'OTHER' THEN 'Outros Documentos'
                    ELSE 'Outros Documentos'
                END
            )::"patient_document_type_enum"
        `);

    await queryRunner.query(`
            DROP TYPE "patient_document_type_enum_old"
        `);

    // Adicionar novos índices para otimizar queries do PatientDocumentRepository
    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_description"
            ON "dv_patient_document" ("description")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_requester_name"
            ON "dv_patient_document" ("requester_name")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_exam_location"
            ON "dv_patient_document" ("exam_location")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_exam_date"
            ON "dv_patient_document" ("exam_date")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_tuss_code"
            ON "dv_patient_document" ("tuss_code")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_tuss_category"
            ON "dv_patient_document" ("tuss_category")
        `);

    // Índices compostos para otimizar queries específicas
    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_patient_type"
            ON "dv_patient_document" ("patient_id", "type")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_patient_description"
            ON "dv_patient_document" ("patient_id", "description")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_patient_exam_date"
            ON "dv_patient_document" ("patient_id", "exam_date")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_patient_tuss_code"
            ON "dv_patient_document" ("patient_id", "tuss_code")
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_patient_active"
            ON "dv_patient_document" ("patient_id", "is_active", "deleted_at")
        `);

    // Índice para performance em queries de filtros disponíveis
    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_document_filters"
            ON "dv_patient_document" ("patient_id", "deleted_at", "type", "description", "requester_name", "exam_location")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índices adicionados em dv_patient_document
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_filters"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_patient_active"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_patient_tuss_code"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_patient_exam_date"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_patient_description"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_patient_type"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_tuss_category"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_tuss_code"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_exam_date"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_exam_location"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_requester_name"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_description"`);

    // Reverter enum para valores originais (chaves)
    await queryRunner.query(`
            ALTER TYPE "patient_document_type_enum" RENAME TO "patient_document_type_enum_old"
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
            ALTER TABLE "dv_patient_document"
            ALTER COLUMN "type" TYPE "patient_document_type_enum"
            USING (
                CASE "type"::text
                    WHEN 'Exame Laboratorial/Imagem' THEN 'LABORATORY_EXAM'
                    WHEN 'Receituário Médico / Prescrição' THEN 'PRESCRIPTION'
                    WHEN 'Atestado / Declaração' THEN 'MEDICAL_CERTIFICATE'
                    WHEN 'Laudo / Relatório Médico' THEN 'MEDICAL_REPORT'
                    WHEN 'Pedido de Exame / Encaminhamento' THEN 'EXAM_REQUEST'
                    WHEN 'Prontuário / Ficha Clínica' THEN 'MEDICAL_RECORD'
                    WHEN 'Carteira de Vacinação' THEN 'VACCINATION_CARD'
                    WHEN 'Outros Documentos' THEN 'OTHER'
                    ELSE 'OTHER'
                END
            )::"patient_document_type_enum"
        `);

    await queryRunner.query(`
            DROP TYPE "patient_document_type_enum_old"
        `);

    // Reverter alteração do exam_month
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            ALTER COLUMN "exam_month" TYPE DATE
        `);

    // Remover colunas TUSS
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            DROP COLUMN "tuss_category"
        `);

    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            DROP COLUMN "tuss_code"
        `);

    // Recriar coluna media_id
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            ADD COLUMN "media_id" uuid NOT NULL
        `);

    // Recriar FK constraint
    await queryRunner.query(`
            ALTER TABLE "dv_patient_document"
            ADD CONSTRAINT "FK_dv_patient_document_media"
            FOREIGN KEY ("media_id")
            REFERENCES "dv_media" ("id")
            ON DELETE CASCADE
            ON UPDATE NO ACTION
        `);

    // Remover tabela dv_patient_document_media
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_media_deleted_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_media_is_active"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_media_order"`);
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_media_is_primary"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_media_media_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_dv_patient_document_media_document_id"`,
    );
    await queryRunner.query(`DROP TABLE "dv_patient_document_media"`);

    // Remover tabela dv_tuus_category
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_name_lower"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_name"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_category"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_deleted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_tuus_category_is_active"`);
    await queryRunner.query(`DROP TABLE "dv_tuus_category"`);
  }
}
