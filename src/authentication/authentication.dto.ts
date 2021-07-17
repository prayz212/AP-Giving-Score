import {IsString, IsEmail, IsNotEmpty, IsIn, Contains, IsUUID} from 'class-validator'

const HOST_DOMAIN = process.env.GMAIL_HOST_DOMAIN

export class InviteDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
	@Contains(HOST_DOMAIN)
    public email: string;

	@IsNotEmpty()
	@IsString()
	@IsIn(['admin', 'manager', 'user'])
	public role: string
}

export class LogInDto {
	@IsNotEmpty()
	@IsEmail()
	@IsString()
	@Contains(HOST_DOMAIN)
	public email: string;

	@IsNotEmpty()
	@IsString()
	public password: string;
}

export class RegisterDto {
	@IsNotEmpty()
	@IsEmail()
	@IsString()
	@Contains(HOST_DOMAIN)
	public email: string;

	@IsNotEmpty()
	@IsString()
	public password: string;
}

export class RequestForgotPasswordDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
	@Contains(HOST_DOMAIN)
    public email: string;
}

export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsString()
    @IsUUID()
	public id: string;

	@IsNotEmpty()
	@IsString()
	public password: string;
}