import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserJoinProjectTable1622703829094 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `create table "user_join_project"
            (
                project_id      uuid                                        not null,
                user_id         uuid                                        not null,
                created_at      timestamp   default CURRENT_TIMESTAMP(6)    not null,
                updated_at      timestamp   default CURRENT_TIMESTAMP(6)    not null,
                "IsDeleted"     boolean     default false                   not null,
                constraint "PK_PROJECT_ID_USER_ID_USER_JOIN_PROJECT" primary key(project_id, user_id),
                constraint "FK_ID_PROJECT" foreign key(project_id) references public.project(id),
                constraint "FK_ID_USER" foreign key(user_id) references public.user(id)
            );
    
            alter table "user_join_project"
            owner to postgres;
            `
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table "user_join_project"`)
    }

}
