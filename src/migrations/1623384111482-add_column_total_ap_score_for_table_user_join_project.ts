import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnTotalApScoreForTableUserJoinProject1623384111482 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table "user_join_project"
            add total_ap_score int default 0 not null
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table "user_join_project" drop column total_ap_score`)
    }

}
