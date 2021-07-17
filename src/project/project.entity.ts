import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from 'typeorm'
import UserJoinProject from './userJoinProject.entity';

@Entity()
class Project {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public name: string;
    
    @Column()
    public description: string;

    @Column({ type: 'timestamp' })
    public start_date: Date

    @Column({ type: 'timestamp' })
    public end_date: Date

    @Column({default: () => false})
	public IsFinished: boolean;

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

	@OneToMany(() => UserJoinProject, userJoinProject => userJoinProject.project)
	@JoinColumn({name: 'id', referencedColumnName: 'project_id'})
	public usersJoinProject: UserJoinProject[];
}

export default Project;