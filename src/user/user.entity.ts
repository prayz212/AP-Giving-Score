import UserJoinProject from '../project/userJoinProject.entity';
import {Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn} from 'typeorm';
import ScoreGiven from '../project/scoreGiven.entity';

@Entity()
class User {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@Column()
	public fullName: string;

	@Column()
	public email: string;

	@Column()
	public role: string;

	@Column({default: "undefined"})
	public password: string;

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
	public created_at: Date;

	@UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
	public updated_at: Date;

	@Column({default: () => false})
	public IsActive: boolean;

	@Column({default: () => false})
	public IsDeleted: boolean;

	@OneToMany(() => UserJoinProject, userJoinProject => userJoinProject.user)
	@JoinColumn({name: 'id', referencedColumnName: 'user_id'})
	public usersJoinProject: UserJoinProject[];

	@OneToMany(() => ScoreGiven, scoreGiven => scoreGiven.receiver)
	@JoinColumn({name: 'id', referencedColumnName: 'receiver_user_id'})
	public scoresGiven: ScoreGiven[];
}

export default User;
