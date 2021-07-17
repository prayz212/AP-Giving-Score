import HttpException from './HttpException';

export class EmailErrorException extends HttpException {
	constructor(message: string) {
		super(10, `Email service occured an error: ${message}`);
	}
}