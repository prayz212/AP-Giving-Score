import {ArrayNotEmpty, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, ValidateNested} from 'class-validator'

export class ProjectDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public id: string;

    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsNotEmpty()
    @IsDateString()
    public start_date: Date

    @IsNotEmpty()
    @IsDateString()
    public end_date: Date

    @IsNotEmpty()
    @IsBoolean()
    public IsFinished: boolean
}

export class CreateProjectDto {
    @IsNotEmpty()
    @IsString()
    public name: string;

    @IsNotEmpty()
    @IsString()
    public description: string;

    @IsNotEmpty()
    @IsDateString()
    public start_date: Date

    @IsNotEmpty()
    @IsDateString()
    public end_date: Date

    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    public member_list: AddUserToProjectDto[]
}

export class AddUserToProjectDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public user_id: string;

    @IsNotEmpty()
    @IsNumber()
    public total_ap_score: number;    
}

export class DeleteProjectDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public id: string;
}

export class RemoveUserToProjectDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public project_id: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public user_id: string;
}

export class UserJoinProjectDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public project_id: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public user_id: string;

    @IsNotEmpty()
    @IsNumber()
    public total_ap_score: number;    
}

export class NewGivingScoreDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public project_id: string;

    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    public score_list: GivingScoreDto[]
}

export class PostGivingScoreDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public receiver_user_id: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public productivity: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public quality: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public accountability: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public supportiveness: number;

    @IsString()
    public strength: string;

    @IsString()
    public constructive_feedback: string;
}

export class GivingScoreDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public project_id: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public giver_user_id: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    public receiver_user_id: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public productivity: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public quality: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public accountability: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public supportiveness: number;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    public given_ap_score: number;

    @IsString()
    public strength: string;

    @IsString()
    public constructive_feedback: string;
}