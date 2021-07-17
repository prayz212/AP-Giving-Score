import {Column, Entity, CreateDateColumn, UpdateDateColumn, PrimaryColumn, ManyToOne, JoinColumn} from 'typeorm';
import User from '../user/user.entity';
import Project from './project.entity';

@Entity()
class ScoreGiven {
    @PrimaryColumn('uuid')
    public project_id: string;
    
    @ManyToOne(() => Project)
    @JoinColumn({name: 'project_id', referencedColumnName: 'id'})
    public project: Project

    @PrimaryColumn('uuid')
    public giver_user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'giver_user_id', referencedColumnName: 'id'})
    public giver: User

    @PrimaryColumn('uuid')
    public receiver_user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({name: 'receiver_user_id', referencedColumnName: 'id'})
    public receiver: User

    @Column({default: 0})
    public productivity: number;

    @Column({default: 0})
    public quality: number;

    @Column({default: 0})
    public accountability: number;

    @Column({default: 0})
    public supportiveness: number;

    @Column({default: 0})
    public given_ap_score: number;

    @Column({default: ''})
    public strength: string

    @Column({default: ''})
    public constructive_feedback: string

	@CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
	public created_at: Date;

	@UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
	public updated_at: Date;

	@Column({default: () => false})
	public IsDeleted: boolean;
}

export default ScoreGiven;