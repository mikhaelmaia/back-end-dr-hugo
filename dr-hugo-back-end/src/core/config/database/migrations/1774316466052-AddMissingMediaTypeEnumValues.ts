import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingMediaTypeEnumValues1774316466052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "media_type_enum" ADD VALUE IF NOT EXISTS 'CSV'`,
    );
    await queryRunner.query(
      `ALTER TYPE "media_type_enum" ADD VALUE IF NOT EXISTS 'ODS'`,
    );
    await queryRunner.query(
      `ALTER TYPE "media_type_enum" ADD VALUE IF NOT EXISTS 'ZIP'`,
    );
    await queryRunner.query(
      `ALTER TYPE "media_type_enum" ADD VALUE IF NOT EXISTS 'RAR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing values from an enum directly.
    // To revert, recreate the enum without the added values and update the column.
    await queryRunner.query(`
      ALTER TABLE "media" ALTER COLUMN "type" TYPE VARCHAR(10)
    `);
    await queryRunner.query(`DROP TYPE "media_type_enum"`);
    await queryRunner.query(`
      CREATE TYPE "media_type_enum" AS ENUM(
        'PNG', 'JPG', 'JPEG', 'GIF', 'PDF',
        'DOCX', 'DOC', 'XLSX', 'XLS', 'PPTX', 'PPT', 'TXT', 'HTML'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "media"
        ALTER COLUMN "type" TYPE "media_type_enum"
          USING "type"::"media_type_enum"
    `);
  }
}
