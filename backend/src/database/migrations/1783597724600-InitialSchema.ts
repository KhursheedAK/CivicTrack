import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1783597724600 implements MigrationInterface {
  name = 'InitialSchema1783597724600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "complaint_attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "complaint_id" uuid NOT NULL, "file_url" character varying(500) NOT NULL, "file_name" character varying(255) NOT NULL, "mime_type" character varying(100) NOT NULL, "cloudinary_public_id" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7ec95c3841ee14767fa956749f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."complaint_updates_status_changed_to_enum" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "complaint_updates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "complaint_id" uuid NOT NULL, "author_id" uuid NOT NULL, "comment" text NOT NULL, "status_changed_to" "public"."complaint_updates_status_changed_to_enum", "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_10b741a04bf6872b5e7fd386180" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."complaints_status_enum" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "complaints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tracking_code" character varying(20) NOT NULL, "title" character varying(200) NOT NULL, "description" text NOT NULL, "location" character varying(200) NOT NULL, "latitude" double precision, "longitude" double precision, "status" "public"."complaints_status_enum" NOT NULL DEFAULT 'SUBMITTED', "citizen_id" uuid NOT NULL, "department_id" uuid NOT NULL, "category_id" uuid NOT NULL, "assigned_officer_id" uuid, "resolved_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_7e9c96351db15c12f23b077ecbf" UNIQUE ("tracking_code"), CONSTRAINT "PK_4b7566a2a489c2cc7c12ed076ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7e9c96351db15c12f23b077ecb" ON "complaints"  ("tracking_code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "department_id" uuid NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('CITIZEN', 'OFFICER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CITIZEN', "is_verified" boolean NOT NULL DEFAULT false, "verification_token" character varying(255), "verification_token_expires" TIMESTAMP WITH TIME ZONE, "reset_token" character varying(255), "reset_token_expires" TIMESTAMP WITH TIME ZONE, "refresh_token_hash" character varying(255), "department_id" uuid, "notification_preferences" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('STATUS_CHANGED', 'NEW_COMPLAINT', 'REASSIGNED', 'COMMENT_ADDED', 'DATA_CORRECTION_REQUESTED', 'DATA_CORRECTION_RESOLVED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "message" character varying(500) NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "reference_id" uuid, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_correction_requests_target_type_enum" AS ENUM('COMPLAINT', 'PROFILE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_correction_requests_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_correction_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requested_by_id" uuid NOT NULL, "target_type" "public"."data_correction_requests_target_type_enum" NOT NULL, "complaint_id" uuid, "fields_flagged" jsonb NOT NULL, "current_data" text NOT NULL, "requested_correction" text NOT NULL, "status" "public"."data_correction_requests_status_enum" NOT NULL DEFAULT 'PENDING', "admin_notes" text, "resolved_by_id" uuid, "resolved_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d53ea5b8f9d5454a191158c3d8f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaint_attachments" ADD CONSTRAINT "FK_399054cdf88612ae7190f7307c4" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaint_updates" ADD CONSTRAINT "FK_638b969c7f3bb20b88929e22a75" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaint_updates" ADD CONSTRAINT "FK_cfb7bbb93a185535dc4a3f65487" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" ADD CONSTRAINT "FK_cfa7420185b0fec0d07c4a590be" FOREIGN KEY ("citizen_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" ADD CONSTRAINT "FK_7ca6ad614eabd4e44369220eb3b" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" ADD CONSTRAINT "FK_d7645a160e0e65580a347917856" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" ADD CONSTRAINT "FK_a7ce058b86038f820efa7626bb0" FOREIGN KEY ("assigned_officer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_61c512b80008be608f1b4b34831" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_correction_requests" ADD CONSTRAINT "FK_c2ce67e92e0b6ede528b81fa6c6" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_correction_requests" ADD CONSTRAINT "FK_44b944e2e78f76013f470f6ade0" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_correction_requests" ADD CONSTRAINT "FK_e2e9bfd0221ab842dedac905d56" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_correction_requests" DROP CONSTRAINT "FK_e2e9bfd0221ab842dedac905d56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_correction_requests" DROP CONSTRAINT "FK_44b944e2e78f76013f470f6ade0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_correction_requests" DROP CONSTRAINT "FK_c2ce67e92e0b6ede528b81fa6c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_0921d1972cf861d568f5271cd85"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_61c512b80008be608f1b4b34831"`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" DROP CONSTRAINT "FK_a7ce058b86038f820efa7626bb0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" DROP CONSTRAINT "FK_d7645a160e0e65580a347917856"`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" DROP CONSTRAINT "FK_7ca6ad614eabd4e44369220eb3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaints" DROP CONSTRAINT "FK_cfa7420185b0fec0d07c4a590be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaint_updates" DROP CONSTRAINT "FK_cfb7bbb93a185535dc4a3f65487"`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaint_updates" DROP CONSTRAINT "FK_638b969c7f3bb20b88929e22a75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "complaint_attachments" DROP CONSTRAINT "FK_399054cdf88612ae7190f7307c4"`,
    );
    await queryRunner.query(`DROP TABLE "data_correction_requests"`);
    await queryRunner.query(
      `DROP TYPE "public"."data_correction_requests_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."data_correction_requests_target_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7e9c96351db15c12f23b077ecb"`,
    );
    await queryRunner.query(`DROP TABLE "complaints"`);
    await queryRunner.query(`DROP TYPE "public"."complaints_status_enum"`);
    await queryRunner.query(`DROP TABLE "complaint_updates"`);
    await queryRunner.query(
      `DROP TYPE "public"."complaint_updates_status_changed_to_enum"`,
    );
    await queryRunner.query(`DROP TABLE "complaint_attachments"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
