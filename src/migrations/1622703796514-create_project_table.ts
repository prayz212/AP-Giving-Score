import {MigrationInterface, QueryRunner} from "typeorm";

export class createProjectTable1622703796514 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `create table "project"
            (
                id              uuid      default uuid_generate_v4()       not null constraint "PK_ID_PROJECT" primary key,
                name            varchar                                    not null,
                description     varchar                                    not null,
                start_date      timestamp      not null,
                end_date        timestamp     not null,
                "IsFinished"    boolean   default false                    not null,
                created_at      timestamp default CURRENT_TIMESTAMP(6)     not null,
                updated_at      timestamp default CURRENT_TIMESTAMP(6)     not null,
                "IsDeleted"     boolean   default false                    not null                
            );
    
            alter table "project"
                owner to postgres;
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table "project"`)
    }

}
