import {MigrationInterface, QueryRunner} from "typeorm";

export class createScoreGivenTable1623384566958 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `create table "score_given"
            (
                project_id      uuid                                        not null,
                giver_user_id         uuid                                        not null,
                receiver_user_id         uuid                                        not null,
                productivity    int     default 0   not null,
                quality    int     default 0   not null,
                accountability    int     default 0   not null,
                supportiveness    int     default 0   not null,
                strength    varchar     default ''   not null,
                constructive_feedback    varchar     default ''   not null,
                created_at      timestamp   default CURRENT_TIMESTAMP(6)    not null,
                updated_at      timestamp   default CURRENT_TIMESTAMP(6)    not null,
                "IsDeleted"     boolean     default false                   not null,
                constraint "PK_PROJECT_ID_GIVER_ID_RECEIVER_ID_SCORE_GIVEN" primary key(project_id, giver_user_id, receiver_user_id),
                constraint "FK_PROJECT_ID" foreign key(project_id) references public.project(id),
                constraint "FK_GIVER_USER_ID" foreign key(giver_user_id) references public.user(id),
                constraint "FK_RECEIVER_USER_ID" foreign key(receiver_user_id) references public.user(id)
            );
    
            alter table "score_given"
            owner to postgres;
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table "score_given"`)
    }

}
