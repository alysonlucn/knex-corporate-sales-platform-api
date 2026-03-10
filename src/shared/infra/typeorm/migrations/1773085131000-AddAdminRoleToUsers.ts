import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminRoleToUsers1773085131000 implements MigrationInterface {
  name = 'AddAdminRoleToUsers1773085131000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'admin' value to the users_role_enum type
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" ADD VALUE 'admin' BEFORE 'consumer'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require creating a new type and migrating data
    // For rollback purposes, we'll just leave this as is
  }
}
