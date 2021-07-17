import {MigrationInterface, QueryRunner} from "typeorm";

export class addDefaultValueColumnPasswordOfUserTable1622774822483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `alter table "user"
        alter column password set default 'undefined'
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `alter table "user"
            alter column password drop default
            `
        )
    }

}
