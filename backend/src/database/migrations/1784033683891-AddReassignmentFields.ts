import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReassignmentFields1784033683891 implements MigrationInterface {
    name = 'AddReassignmentFields1784033683891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" ADD "reassignment_requested" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "reassignment_reason" text`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD "reassignment_rejected" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "reassignment_rejected"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "reassignment_reason"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP COLUMN "reassignment_requested"`);
    }

}
