import {getRepository} from 'typeorm';
import User from '../user/user.entity';
import { CreateUserDto } from '../user/user.dto';
import * as bcrypt from 'bcrypt'
import { UserWithThatEmailAlreadyAcitveException, 
		 UserWithThatEmailNotAcitveException, 
		 UserWithThatEmailAlreadyExistsException, 
		 UserWithThatEmailNotExistsException,
		 UserWithThatIdNotExistsException,
		 WrongCredentialsException
	} from '../exceptions/UserException';
import TokenServices from '../utils/token.services';
import { TokenAuthenticateData, TokenResetPasswordData } from '../interfaces/token.interface';
import { LogInDto, RequestForgotPasswordDto, RegisterDto, ForgotPasswordDto } from './authentication.dto';

const EXPIRE_TIME_FOR_INVITE_TOKEN = 10*60
const EXPIRE_TIME_FOR_AUTHENTICATE_TOKEN = 60*60*2
const EXPIRE_TIME_FOR_RESET_PASSWORD_TOKEN = 60*5
const AUTHEN_TOKEN_TYPE = process.env.AUTHEN_TOKEN_TYPE
const INVITE_TOKEN_TYPE = process.env.INVITE_TOKEN_TYPE
const RESET_PASSWORD_TOKEN_TYPE = process.env.RESET_PASSWORD_TOKEN_TYPE
const SALT_ROUNDS = 10

class AuthenticationService {
	private userRepository = getRepository(User);
	private tokenService = new TokenServices();

	public registerNewAccount = async (userData: CreateUserDto) => {
		const checkUserExistInDatabase: User = await this.userRepository.findOne({email: userData.email})
		if (checkUserExistInDatabase && !checkUserExistInDatabase.IsDeleted) {
			throw new UserWithThatEmailAlreadyExistsException(userData.email);
		}
		const user: User = await this.userRepository.save(userData)
		const token: TokenAuthenticateData = this.tokenService.createAuthenticateToken(user, INVITE_TOKEN_TYPE, EXPIRE_TIME_FOR_INVITE_TOKEN)	
		return {user, token}	
	}

	public rollbackRegisterNewAccount = async (email: string) => {
		await this.userRepository.delete({email})
	}

	public joiningNewAccount = async (registerData: RegisterDto) => {
		const userNeedToUpdate: User = await this.userRepository.findOne({email: registerData.email})
		if (!userNeedToUpdate) {
			throw new UserWithThatEmailNotExistsException(registerData.email);
		} else if (userNeedToUpdate.IsActive) {
			throw new UserWithThatEmailAlreadyAcitveException(registerData.email);
		}
		const hashedPassword = await bcrypt.hash(registerData.password, SALT_ROUNDS);
		const user = this.userRepository.create({
			...userNeedToUpdate,
			password: hashedPassword,
			IsActive: true
		});
		await this.userRepository.save(user);
	}

	public logIn = async (logInDto: LogInDto) => {
		const user: User = await this.userRepository.findOne({ email: logInDto.email });
		
		if (user) {
			const isPasswordMatching = await bcrypt.compare(logInDto.password, user.password);
			if (isPasswordMatching) {
				delete user.password
				let tokenData: TokenAuthenticateData = this.tokenService.createAuthenticateToken(user, AUTHEN_TOKEN_TYPE, EXPIRE_TIME_FOR_AUTHENTICATE_TOKEN);
				return { tokenData, role: user.role }
			} else {
				throw new WrongCredentialsException();
			}
		} else {
			throw new WrongCredentialsException();
		}
	}

	public resetPasswrod = async (requestData: RequestForgotPasswordDto) => {
		const user: User = await this.userRepository.findOne({ email: requestData.email });

		if (user) {
			if (!user.IsActive) {
				throw new UserWithThatEmailNotAcitveException(user.email)
			} else if (user.IsDeleted) {
				throw new UserWithThatEmailNotExistsException(user.email)
			}
			const token: TokenResetPasswordData = this.tokenService.createResetPasswordToken(user, RESET_PASSWORD_TOKEN_TYPE, EXPIRE_TIME_FOR_RESET_PASSWORD_TOKEN)
			const returnUserInfo = {fullName: user.fullName, email: user.email}
			return {user: returnUserInfo, token}
		} else {
			throw new WrongCredentialsException();
		}
	}

	public updatePassword = async (newPasswordData: ForgotPasswordDto) => {
		const userNeedToUpdate: User = await this.userRepository.findOne(newPasswordData.id)
		if (!userNeedToUpdate) {
			throw new UserWithThatIdNotExistsException(newPasswordData.id);
		} 
		const hashedPassword = await bcrypt.hash(newPasswordData.password, 10);
		const user = this.userRepository.create({
			...userNeedToUpdate,
			password: hashedPassword
		});
		await this.userRepository.save(user);
	}
}

export default AuthenticationService;
