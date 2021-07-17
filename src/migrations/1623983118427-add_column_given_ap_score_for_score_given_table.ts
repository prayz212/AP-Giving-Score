import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnGivenApScoreForScoreGivenTable1623983118427 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table "score_given"
            add given_ap_score int not null
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> { 
        await queryRunner.query(`alter table "score_given" drop column given_ap_score`)
    }
}
