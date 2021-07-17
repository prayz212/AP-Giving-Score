import HttpException from './HttpException';

export class ProjectWithThatIDNotExistsException extends HttpException {
	constructor(id: string) {
		super(400,`Project with id: "${id}" not exists`);
	}
}

export class ProjectWithThatNameAlreadyExistsException extends HttpException {
	constructor(name: string) {
		super(400,`Project with name:"${name}" already exists`);
	}
}

export class ProjectWithThatIDAlreadyFinishedException extends HttpException {
	constructor(id: string) {
		super(400,`Project with id:"${id}" already finished`);
	}
}

export class UserJoiningProjectNotExistsException extends HttpException {
	constructor(user_id: string, project_id: string) {
		super(400,`Can not find project with id (${project_id}) and user with id(${user_id}) in database`);
	}
}

export class ProjectWithThatUserAlreadyExistException extends HttpException {
	constructor(project_id: string, user_id: string) {
		super(400,`Project with id (${project_id}) already exist user with id (${user_id})`);
	}
}

export class InvalidRatingException extends HttpException {
	constructor() {
		super(400,`Rating must between 1 and 5`);
	}
}