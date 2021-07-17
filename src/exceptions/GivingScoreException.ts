import HttpException from './HttpException';

export class ReceiverWithThatIdNotExistsException extends HttpException {
	constructor(receiver_id: string) {
		super(401, `Receiver with id (${receiver_id}) is not valid.`);
	}
}

export class ReceiverWithThatIdAlreadyExistsException extends HttpException {
	constructor(receiver_id: string) {
		super(401, `Receiver with id (${receiver_id}) is already exist in database.`);
	}
}

export class CanNotGivingScoreToItselfException extends HttpException {
	constructor() {
		super(401, 'Giver can not giving scores to itself.')
	}
}