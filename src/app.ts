import * as express from 'express'
import * as cookieParser from 'cookie-parser';
import errorMiddleware from './middleware/error.middleware'
import Controller from './interfaces/controller.interface';
import * as cors from 'cors'

class App {
	private app: express.Application;

	constructor(controllers: Controller[]) {
		this.app = express();

		this.initializeMiddlewares();
		this.initializeControllers(controllers);
		this.initializeErrorHandling();
	}

	public listen() {
		this.app.listen(process.env.PORT || 8080, () => {
			console.log(`App running on the port ${process.env.PORT || 8080}`)
		});
	}

	public getServer() {
		return this.app;
	}

	private initializeMiddlewares() {
		this.app.use(express.json());
		this.app.use(cookieParser());
		this.app.use(cors())
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}

	private initializeControllers(controllers: Controller[]) {
		controllers.forEach((controller) => {
			this.app.use('/', controller.router);
		});
	}
}

export default App;
