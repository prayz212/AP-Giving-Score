import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserTable1622339567535 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `create table "user"
             (
                 id          uuid      default uuid_generate_v4()   not null
                     constraint "PK_cace4a159ff9f2512dd42373760"
                         primary key,
                 "fullName"  varchar                                not null,
                 email       varchar                                not null,
                 password    varchar                                not null,
                 created_at  timestamp default CURRENT_TIMESTAMP(6) not null,
                 updated_at  timestamp default CURRENT_TIMESTAMP(6) not null,
                 "IsDeleted" boolean   default false                not null
             );

            alter table "user"
                owner to postgres;
`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`drop table "user"`)
    }
}
