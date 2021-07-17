import {Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import User from '../user/user.entity';
import Project from './project.entity';


@Entity()
class UserJoinProject {
	@PrimaryColumn('uuid')
	public project_id: string;

	@ManyToOne(() => Project)
    @JoinColumn({name: 'project_id', referencedColumnName: 'id'})
	public project: Project;

    @PrimaryColumn('uuid')
	public user_id: string;

	@ManyToOne(() => User, user => user.usersJoinProject)
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
	public user: User;

	@Column({default: 0})
	public total_ap_score: number;

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
	public created_at: Date;

	@UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
	public updated_at: Date;

	@Column({default: () => false})
	public IsDeleted: boolean;

	@Column()
    public created_user: string;
    
    @Column()
    public updated_user: string;
}

export default UserJoinProject;
