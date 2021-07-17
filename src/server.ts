import 'dotenv/config'
import 'reflect-metadata'
import {createConnection} from 'typeorm';
import * as config from './ormconfig';
import App from './app';
import AuthenticationController from './authentication/authentication.controller';
import UsersController from './user/users.controller';
import ProjectController from './project/project.controller'


(async () => {
	try {
		const connection = await createConnection(config);
		await connection.runMigrations();
	} catch (error) {
		console.error(error);
		return error;
	}
	const app = new App(
		[
			new AuthenticationController(),
			new UsersController(),
			new ProjectController()
		],
	);

	app.listen();
})();
