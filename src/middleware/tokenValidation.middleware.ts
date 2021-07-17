import { TokenErrorException, InvalidTokenException, NoTokenAttachedException } from '../exceptions/TokenException';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken'
import { AuthenticateDataStoredIntoken } from '../interfaces/token.interface';
import {getRepository} from 'typeorm';
import User from '../user/user.entity';

const AUTHEN_TOKEN_TYPE = process.env.AUTHEN_TOKEN_TYPE
const INVITE_TOKEN_TYPE = process.env.INVITE_TOKEN_TYPE
const RESET_PASSWORD_TOKEN_TYPE = process.env.RESET_PASSWORD_TOKEN_TYPE
const PRIVATE_KEY = process.env.JWT_SECRET

export async function tokenAuthenticateValidationMiddleware (request: Request, response: Response, next: NextFunction) {
	if (!request.headers.authorization) {
		return next(new NoTokenAttachedException())
    } 

	try {
		const token = request.headers.authorization
		const userRepository = getRepository(User)
		let {id, type} = jwt.verify(token, PRIVATE_KEY) as AuthenticateDataStoredIntoken
		
		if (type !== AUTHEN_TOKEN_TYPE) {
			next(new InvalidTokenException());
		}
		
		const user = await userRepository.findOne({id, IsActive: true,  IsDeleted: false});
		if (user) {
			request.body.token_user_id = user.id
			request.body.token_user_fullName = user.fullName
			request.body.token_user_email = user.email
			request.body.token_user_role = user.role
			next();
		} else {
			next(new InvalidTokenException());
		}
	} catch (error) {
		next(new TokenErrorException(error.message))
	}
}

export async function tokenInviteValidationMiddleware(request: Request, response: Response, next: NextFunction) {
	if (!request.headers.authorization) {
		return next(new NoTokenAttachedException())
    } 

	try {
		const token = request.headers.authorization
		const userRepository = getRepository(User)
		let {id, type} = jwt.verify(token, PRIVATE_KEY) as AuthenticateDataStoredIntoken
		
		if (type !== INVITE_TOKEN_TYPE) {
			next(new InvalidTokenException())
		}
		
		const user = await userRepository.findOne(id);
		if (user) {
			request.body.id = user.id
			request.body.fullName = user.fullName
			request.body.email = user.email
			request.body.active = user.IsActive
			next();
		} else {
			next(new InvalidTokenException());
		}
	} catch (error) {
		next(new TokenErrorException(error.message))
	}
}

export async function tokenResetPasswordValidationMiddleware(request: Request, response: Response, next: NextFunction) {
	if (!request.headers.authorization) {
		return next(new NoTokenAttachedException()) 
    } 

	try {
		const token = request.headers.authorization
		const userRepository = getRepository(User)
		let {id, type} = jwt.verify(token, PRIVATE_KEY) as AuthenticateDataStoredIntoken
		
		if (type !== RESET_PASSWORD_TOKEN_TYPE) {
			next(new InvalidTokenException())
		}
		
		const user = await userRepository.findOne(id);
		if (user) {
			request.body.id = user.id
			request.body.fullName = user.fullName
			request.body.email = user.email
			next();
		} else {
			next(new InvalidTokenException());
		}
	} catch (error) {
		next(new TokenErrorException(error.message))
	}
}