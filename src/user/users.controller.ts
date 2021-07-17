import Controller from '../interfaces/controller.interface';
import * as express from 'express';
import UserServices from './user.services';
import { tokenAuthenticateValidationMiddleware } from '../middleware/tokenValidation.middleware';
import { UserDto } from './user.dto';

class UsersController implements Controller {
	public path = '/users';
	public router = express.Router();
	public userService: UserServices;

	constructor() {
		this.initializeRouters();
		this.userService = new UserServices()
	}

	private initializeRouters() {
		this.router.get(this.path, tokenAuthenticateValidationMiddleware, this.getAllUser);
	}

	private getAllUser = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
		try {
            const userList: UserDto[] = await this.userService.getUserList();
            response.send({status: 200, data: userList})
		} catch (error) {
			next(error)
		}
	}
}

export default UsersController;
