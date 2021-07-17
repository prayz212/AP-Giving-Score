import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnRoleForTableUser1623379792740 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table "user"
            add role varchar not null
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table "user" drop column role`)
    }

}
