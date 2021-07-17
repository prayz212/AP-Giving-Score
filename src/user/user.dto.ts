import { IsString, IsNotEmpty, IsEmail, IsIn, IsUUID } from 'class-validator'

export class CreateUserDto {
	@IsNotEmpty()
	@IsString()
	public fullName: string;

	@IsNotEmpty()
	@IsString()
	@IsEmail()
	public email: string

	@IsNotEmpty()
	@IsString()
	@IsIn(['admin', 'manager', 'user'])
	public role: string
}

export class UserDto {
	@IsNotEmpty()
    @IsString()
    @IsUUID()
	public id: string;

	@IsNotEmpty()
	@IsString()
	public fullName: string;

	@IsNotEmpty()
	@IsString()
	@IsEmail()
	public email: string

	@IsNotEmpty()
	@IsString()
	@IsIn(['admin', 'manager', 'user'])
	public role: string
}