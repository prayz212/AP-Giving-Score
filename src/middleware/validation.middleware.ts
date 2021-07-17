import * as express from "express";
import {validate, ValidationError} from 'class-validator';
import {plainToClass} from 'class-transformer';
import HttpException from '../exceptions/HttpException';

function validationMiddleware<T>(type: any, skipMissingProperties = false): express.RequestHandler {
	return(req, res, next) => {
		validate(plainToClass(type, req.body), {skipMissingProperties})
			.then((errors: ValidationError[]) => {
				if (errors.length > 0) {
					const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
					next(new HttpException(400, message));
				} else {
					next();
				}
			});
	};
}

export default validationMiddleware;
