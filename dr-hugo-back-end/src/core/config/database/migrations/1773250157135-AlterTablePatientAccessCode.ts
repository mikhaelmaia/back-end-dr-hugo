import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTablePatientAccessCode1773250157135 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar enum para InstitutionalUserRole
    await queryRunner.query(`
            CREATE TYPE "institutional_user_role_enum" AS ENUM('DOCTOR', 'INSTITUTION')
        `);

    // Adicionar coluna role (obrigatória) usando o enum criado
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            ADD COLUMN "role" "institutional_user_role_enum" NOT NULL DEFAULT 'DOCTOR'
        `);

    // Adicionar coluna documents_ids (opcional - array de texto)
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            ADD COLUMN "documents_ids" text[]
        `);

    // Remover coluna used_at que não está sendo utilizada na entidade
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            DROP COLUMN IF EXISTS "used_at"
        `);

    // Adicionar coluna persistent (opcional - indica se o acesso é persistente)
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            ADD COLUMN "persistent" boolean NOT NULL DEFAULT false
        `);

    // Criar índice na coluna role para otimizar consultas por tipo de usuário
    await queryRunner.query(`
            CREATE INDEX "IDX_dv_patient_access_code_role" 
            ON "dv_patient_access_code" ("role")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover índice da coluna role
    await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_dv_patient_access_code_role"
        `);

    // Adicionar de volta a coluna used_at
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            ADD COLUMN "used_at" TIMESTAMP
        `);

    // Remover coluna persistent
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            DROP COLUMN IF EXISTS "persistent"
        `);

    // Remover coluna documents_ids
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            DROP COLUMN IF EXISTS "documents_ids"
        `);

    // Remover coluna role (que usa o enum)
    await queryRunner.query(`
            ALTER TABLE "dv_patient_access_code" 
            DROP COLUMN IF EXISTS "role"
        `);

    // Remover enum InstitutionalUserRole
    await queryRunner.query(`
            DROP TYPE IF EXISTS "institutional_user_role_enum"
        `);
  }
}
