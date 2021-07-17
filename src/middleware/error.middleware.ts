import HttpException from '../exceptions/HttpException';
import {NextFunction, Response, Request} from 'express';

function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
	const status = error.status || 500;
	const message = error.message || 'Some thing went wrong';
	response.status(status).send({
		message,
		status,
	});
}

export default errorMiddleware;
