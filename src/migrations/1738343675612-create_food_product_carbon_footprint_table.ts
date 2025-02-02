import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFoodProductCarbonFootprintTable1738343675612 implements MigrationInterface {
    name = 'CreateFoodProductCarbonFootprintTable1738343675612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "food_product_carbon_footprints" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "carbonFootprintInKgCO2e" double precision, CONSTRAINT "UQ_abe198cc6f8270c74cce5f26634" UNIQUE ("name"), CONSTRAINT "PK_9b04987366c0ff87b725bcb5cee" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "food_product_carbon_footprints"`);
    }

}
