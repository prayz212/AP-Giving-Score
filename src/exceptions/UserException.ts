import HttpException from './HttpException';

export class UserWithThatEmailNotAcitveException extends HttpException {
	constructor(email: string) {
		super(401, `User with email: ${email} is not active.`);
	}
}

export class UserWithThatEmailAlreadyAcitveException extends HttpException {
	constructor(email: string) {
		super(401, `User with email: ${email} already active.`);
	}
}

export class UserWithThatEmailAlreadyExistsException extends HttpException {
	constructor(email: string) {
		super(401, `User with email: ${email} already exists`);
	}
}

export class UserWithThatEmailNotExistsException extends HttpException {
	constructor(email: string) {
		super(401, `User with email: ${email} not exists`);
	}
}

export class UserWithThatIdNotExistsException extends HttpException {
    constructor(id: string) {
        super(406, `User with id: "${id}" not exists`);
    }
}

export class IncorrectAcceptHostDomainException extends HttpException {
    constructor() {
        super(406, 'Incorrect email accept host domain');
    }
}

export class WrongCredentialsException extends HttpException {
	constructor() {
		super(401, 'Wrong credentials provided');
	}
}

export class UserWithThatIdNotActiveException extends HttpException {
    constructor(id: string) {
        super(401, `User with id: "${id}" is not active`);
    }
}

export class UserUnauthorizedException extends HttpException {
	constructor() {
        super(403, 'User dont have permission to access this content');
    }
}