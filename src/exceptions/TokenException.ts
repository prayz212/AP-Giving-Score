import HttpException from './HttpException';

export class InvalidTokenException extends HttpException {
	constructor() {
		super(401, 'Invalid token');
	}
}

export class TokenErrorException extends HttpException {
	constructor(message: string) {
		super(401, `Token error: ${message}`);
	}
}

export class NoTokenAttachedException extends HttpException {
	constructor() {
		super(401, "You must attach token in the request header");
	}
}