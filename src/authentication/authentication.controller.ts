import * as express from 'express';
import Controller from '../interfaces/controller.interface';
import AuthenticationService from './authentication.services';
import EmailServices from '../utils/email.services'
import { CreateUserDto } from '../user/user.dto';
import validationMiddleware from '../middleware/validation.middleware';
import { LogInDto, InviteDto, RequestForgotPasswordDto, RegisterDto, ForgotPasswordDto } from './authentication.dto';
import { SendMailData } from '../interfaces/mail.interface';
import { tokenInviteValidationMiddleware, tokenResetPasswordValidationMiddleware } from '../middleware/tokenValidation.middleware';
import { UserWithThatEmailAlreadyAcitveException } from '../exceptions/UserException';

class AuthenticationController implements Controller {
	public path = '/auth';
	public router = express.Router();
	private authenticationService: AuthenticationService;
	private emailService: EmailServices;

	constructor() {
		this.initializeRouter();
		this.authenticationService = new AuthenticationService();
		this.emailService = new EmailServices();
	}

	private initializeRouter() {
		this.router.post(`${this.path}/invite`, validationMiddleware(InviteDto), this.invitation);
		this.router.get(`${this.path}/check-invite-token`, tokenInviteValidationMiddleware, this.checkInviteToken);
		this.router.post(`${this.path}/register`, tokenInviteValidationMiddleware, validationMiddleware(RegisterDto), this.registration);
		this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
		this.router.post(`${this.path}/forgot-password-request`, validationMiddleware(RequestForgotPasswordDto), this.requestForgotPassword);
		this.router.get(`${this.path}/check-forgot-password-token`, tokenResetPasswordValidationMiddleware, this.checkForgotPasswordToken);
		this.router.post(`${this.path}/update-new-password`, tokenResetPasswordValidationMiddleware, validationMiddleware(ForgotPasswordDto), this.updateNewPassword);
	}

	private invitation = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
		const {email, role} = request.body
		const inviteUser: CreateUserDto = {fullName: email.split('@')[0], email, role}
		try {
			const {user, token} = await this.authenticationService.registerNewAccount(inviteUser);
			let sendMailData: SendMailData = {fullName: user.fullName, email: user.email, token: token.token}
			await this.emailService.sendingInviteMail(sendMailData)
		    response.send({status: 201, message: "successful"})
		} catch(error) {
			if (error.status == 10) { //Email error status code
				await this.authenticationService.rollbackRegisterNewAccount(email)
				return response.send({status: 503, message: "failure"})
			}

			next(error)
		}
	}
	
	private checkInviteToken = (request: express.Request, response: express.Response, next: express.NextFunction) => {
		try {
			const {email, fullName, active} = request.body
			if (active) throw new UserWithThatEmailAlreadyAcitveException(email) 
			else response.send({status: 201, data: {user: email, fullName: fullName}})
		} catch(error) {
			next(error)
		}
	}

	private registration = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
		const { email, password } = request.body as RegisterDto
		
		try {
			await this.authenticationService.joiningNewAccount({ email, password });
			response.send({status: 201, message: "successful"});
		} catch(error) {
			next(error);
		}
	}

	private loggingIn = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
		const { email, password } = request.body as LogInDto
		try {
			const { tokenData, role } = await this.authenticationService.logIn({ email, password });
			response.send({token: tokenData.token, expiresIn: tokenData.expiresIn, role});
		} catch(error) {
			next(error);
		}
	}

	private requestForgotPassword =  async (request: express.Request, response: express.Response, next: express.NextFunction) => {
		const { email } = request.body as RequestForgotPasswordDto
		try {
			const {token, user} = await this.authenticationService.resetPasswrod({ email })
			let sendMailData: SendMailData = {fullName: user.fullName, email: user.email, token: token.token}			
			await this.emailService.sendingResetPasswordMail(sendMailData)
			response.send({status: 201, message: "successful"});
		} catch(error) {
			if (error.status = 10) { //Email error status code
				console.error(error.message)
				return response.send({status: 503, message: "failure"})
			}

			next(error)
		}
	}

	private checkForgotPasswordToken = (request: express.Request, response: express.Response, next: express.NextFunction) => {
		try {
			const { email, fullName } = request.body 
			response.send({status: 201, data: { email, fullName }})
		} catch(error) {
			next(error)
		}
	}

	private updateNewPassword = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
		const { id, password } = request.body as ForgotPasswordDto
		try {			
			await this.authenticationService.updatePassword({ id, password })
			response.send({status: 201, message: "successful"});
		} catch(error) {
			next(error)
		}
	}
}
export default AuthenticationController;
