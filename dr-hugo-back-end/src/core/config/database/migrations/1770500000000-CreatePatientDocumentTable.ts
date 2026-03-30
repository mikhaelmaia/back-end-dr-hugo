import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientDocumentTable1770500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── ENUM ─────────────────────────────────────────────────────────────────

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

    // ─── dv_patient_document ──────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_patient_document" (
        "id"             uuid                        NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"      boolean                     NOT NULL DEFAULT true,
        "created_at"     TIMESTAMP                   NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP                   DEFAULT now(),
        "deleted_at"     TIMESTAMP,
        "description"    character varying(255)      NOT NULL,
        "type"           "patient_document_type_enum" NOT NULL,
        "exam_date"      DATE                        NOT NULL,
        "exam_month"     character varying(7)        NOT NULL,
        "tuss_code"      character varying(20),
        "tuss_category"  character varying(30),
        "requester_name" character varying(255),
        "exam_location"  character varying(255),
        "observations"   text,
        "patient_id"     uuid                        NOT NULL,
        CONSTRAINT "PK_dv_patient_document" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_patient_document_patient"
          FOREIGN KEY ("patient_id")
          REFERENCES "dv_patient"("id")
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

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_document_patient_month"
      ON "dv_patient_document" ("patient_id", "exam_month")
    `);

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

    await queryRunner.query(`
      CREATE INDEX "IDX_dv_patient_document_filters"
      ON "dv_patient_document" ("patient_id", "deleted_at", "type", "description", "requester_name", "exam_location")
    `);

    // ─── dv_patient_document_media ────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TABLE "dv_patient_document_media" (
        "id"                  uuid    NOT NULL DEFAULT uuid_generate_v4(),
        "is_active"           boolean NOT NULL DEFAULT true,
        "created_at"          TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at"          TIMESTAMP DEFAULT now(),
        "deleted_at"          TIMESTAMP,
        "patient_document_id" uuid    NOT NULL,
        "media_id"            uuid    NOT NULL,
        "is_primary"          boolean NOT NULL DEFAULT false,
        "order"               integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_dv_patient_document_media" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dv_patient_document_media_document"
          FOREIGN KEY ("patient_document_id")
          REFERENCES "dv_patient_document"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION,
        CONSTRAINT "FK_dv_patient_document_media_media"
          FOREIGN KEY ("media_id")
          REFERENCES "dv_media"("id")
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      )
    `);

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
      `DROP INDEX "IDX_dv_patient_document_patient_month"`,
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
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_deleted_at"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_type"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_exam_month"`);
    await queryRunner.query(`DROP INDEX "IDX_dv_patient_document_patient_id"`);
    await queryRunner.query(`DROP TABLE "dv_patient_document"`);

    await queryRunner.query(`DROP TYPE "patient_document_type_enum"`);
  }
}
