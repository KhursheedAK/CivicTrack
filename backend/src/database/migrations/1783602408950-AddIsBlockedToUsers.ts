import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsBlockedToUsers1783602408950 implements MigrationInterface {
    name = 'AddIsBlockedToUsers1783602408950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "is_blocked" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_blocked"`);
    }

}
