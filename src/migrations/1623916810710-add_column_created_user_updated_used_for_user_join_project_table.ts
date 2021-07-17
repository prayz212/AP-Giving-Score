import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnCreatedUserUpdatedUserForUserJoinProjectTable1623916810710 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            alter table "user_join_project"
            add created_user uuid not null,
            add updated_user uuid not null,
            add constraint "FK_ID_USER_CREATED" foreign key(created_user) references public.user(id),
            add constraint "FK_ID_USER_UPDATED" foreign key(updated_user) references public.user(id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`alter table "user_join_project" drop column created_user, updated_user`)
    }

}
