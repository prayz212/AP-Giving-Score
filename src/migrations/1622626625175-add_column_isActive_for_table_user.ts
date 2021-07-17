import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnIsActiveForTableUser1622626625175 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table "user"
            add "IsActive" boolean   default false                not null
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table "user" drop column "IsActive"`)
    }

}
