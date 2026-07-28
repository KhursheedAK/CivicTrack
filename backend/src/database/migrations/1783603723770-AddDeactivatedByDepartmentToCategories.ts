import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeactivatedByDepartmentToCategories1783603723770 implements MigrationInterface {
    name = 'AddDeactivatedByDepartmentToCategories1783603723770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "deactivated_by_department" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "deactivated_by_department"`);
    }

}
