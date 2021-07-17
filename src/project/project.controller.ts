import EmailServices from '../utils/email.services';
import * as express from 'express'
import Controller from '../interfaces/controller.interface';
import ProjectServices from './project.services';
import { tokenAuthenticateValidationMiddleware } from '../middleware/tokenValidation.middleware';
import validationMiddleware from '../middleware/validation.middleware'
import { CreateProjectDto, 
         UserJoinProjectDto, 
         ProjectDto, 
         RemoveUserToProjectDto,
         DeleteProjectDto,
         NewGivingScoreDto } from './project.dto';
import UserJoinProject from './userJoinProject.entity';
import { checkManagerRole } from '../middleware/role.middlewares';
import Project from './project.entity';


class ProjectController implements Controller {
    public path = '/projects';
    public router = express.Router();
    public projectService: ProjectServices;
    public emailService: EmailServices;

    constructor() {
        this.initializeRouter();
        this.projectService = new ProjectServices();
        this.emailService = new EmailServices();
    }

    private initializeRouter() {
        this.router.get(`${this.path}/user`, tokenAuthenticateValidationMiddleware, this.getAllProjectByUserId);
        this.router.get(`${this.path}/manager`, tokenAuthenticateValidationMiddleware, checkManagerRole, this.getAllProjectCreatedByUserId);
        this.router.get(`${this.path}/:id`, tokenAuthenticateValidationMiddleware, this.getProjectById);
        this.router.post(this.path, tokenAuthenticateValidationMiddleware, checkManagerRole, validationMiddleware(CreateProjectDto), this.addNewProject);
        this.router.put(this.path, tokenAuthenticateValidationMiddleware, checkManagerRole, validationMiddleware(ProjectDto), this.updateProjectInformation);
        this.router.delete(this.path, tokenAuthenticateValidationMiddleware, checkManagerRole, validationMiddleware(DeleteProjectDto), this.deleteProjectById);

        this.router.post(`${this.path}/invite-user`, tokenAuthenticateValidationMiddleware, checkManagerRole, validationMiddleware(UserJoinProjectDto), this.addNewUserToProject)
        this.router.delete(`${this.path}/remove-user`, tokenAuthenticateValidationMiddleware, checkManagerRole, validationMiddleware(RemoveUserToProjectDto), this.removeUserFromProject)
        this.router.put(`${this.path}/update-user-project`, tokenAuthenticateValidationMiddleware, checkManagerRole, validationMiddleware(UserJoinProjectDto), this.updateUserFromProject)

        this.router.get(`${this.path}/:project_id/user/:user_id`, tokenAuthenticateValidationMiddleware, checkManagerRole, this.getUserJoinProjectByProjectIdAndUserId)
        this.router.get(`${this.path}/:project_id/user`, tokenAuthenticateValidationMiddleware, this.getUserJoinProjectByProjectId)
        this.router.get(`${this.path}/:project_id/given-score-detail/:giver_id`, tokenAuthenticateValidationMiddleware, this.getPersonalGivenScoreDetail)
        this.router.get(`${this.path}/:project_id/received-score-detail/:receiver_id`, tokenAuthenticateValidationMiddleware,  checkManagerRole, this.getPersonalReceivedScoreDetail)
        this.router.post(`${this.path}/giving-scores`, tokenAuthenticateValidationMiddleware, validationMiddleware(NewGivingScoreDto), this.handleGivingScores)
        this.router.get(`${this.path}/:project_id/all-member-score`, tokenAuthenticateValidationMiddleware, checkManagerRole, this.getAllUserJoinProjectById)
        this.router.get(`${this.path}/:project_id/all-member`, tokenAuthenticateValidationMiddleware, this.getAllProjectMember)
    }

    private getAllProjectByUserId = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const userId = request.body.token_user_id
        try {
            const projectList: UserJoinProject[] = await this.projectService.getProjectListUserJoined(userId);
            response.send({status: 200, data: projectList})
        } catch(error) {
            next(error)
        }
    }

    private getAllProjectCreatedByUserId = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const currentUser = request.body.token_user_id
        try {
            const projectList: Project[] = await this.projectService.getProjectListManagerCreated(currentUser);
            response.send({status: 200, data: projectList})
        } catch(error) {
            next(error)
        }
    }

    private getProjectById = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const projectId: string = request.params.id
        const userId: string = request.body.token_user_id
        const userRole: string = request.body.token_user_role
        try {
            const project: Project = await this.projectService.getProject(projectId, userId, userRole);
            response.send({status: 200, data: project})
        } catch(error) {
            next(error)
        }
    }

    private addNewProject = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { name, description, start_date, end_date, member_list } = request.body as CreateProjectDto
        const currentUser: string = request.body.token_user_id
        try {
            await this.projectService.createNewProject(currentUser, { name, description, start_date, end_date, member_list })            
            response.send({status: 201, message: "successful"})
        } catch (error) {
            next(error)
        }
    }

    private updateProjectInformation = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const currentUser: string = request.body.token_user_id
        const { id, name, description, start_date, end_date, IsFinished } = request.body as ProjectDto
        try {
            const project: ProjectDto = await this.projectService.updateProject(currentUser, { id, name, description, start_date, end_date, IsFinished })
            response.send({status: 201, message: "successful", updated: project})
        } catch (error) {
            next(error)
        }
    }
    
    private deleteProjectById = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const currentUser: string = request.body.token_user_id 
        const { id } = request.body as DeleteProjectDto
        try {
            await this.projectService.deleteProject(currentUser, { id })
            response.send({status: 201, message: "successful"})
        } catch (error) {
            next(error)
        }
    }

    private addNewUserToProject = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const currentUser: string = request.body.token_user_id 
        const { project_id, user_id, total_ap_score } = request.body as UserJoinProjectDto
        try {
            const addResult: UserJoinProjectDto = await this.projectService.inviteUser(currentUser, { project_id, user_id, total_ap_score })
            response.send({status: 201, message: "successfull", added: addResult})
        } catch (error) {
            next(error)
        }
    }

    private removeUserFromProject = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const currentUser: string = request.body.token_user_id
        const { project_id, user_id } = request.body as RemoveUserToProjectDto
        try {
            await this.projectService.removeUser(currentUser, { project_id, user_id })
            response.send({status: 201, message: "successfull"})
        } catch (error) {
            next(error)
        }
    }

    private updateUserFromProject = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const currentUser: string = request.body.token_user_id
        const { project_id, user_id, total_ap_score } = request.body as UserJoinProjectDto
        try {
            const updateResult: UserJoinProjectDto = await this.projectService.updateUser(currentUser, { project_id, user_id, total_ap_score })
            response.send({status: 201, message: "successfull", updated: updateResult})
        } catch (error) {
            next(error)
        }
    }

    private handleGivingScores = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { project_id, score_list } = request.body as NewGivingScoreDto
        const giver: string = request.body.token_user_id

        try {
            await this.projectService.addNewGivingScore(giver, { project_id, score_list })
            response.send({status: 201, message: "successfull"})
        } catch (error) {
            next(error)
        }
    }
    
    private getPersonalGivenScoreDetail = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { project_id, giver_id } = request.params
        const { token_user_id, token_user_role } = request.body

        try {
            const givenScoresData = await this.projectService.getGivenScoreDetailByProjectIdAndGiverId(project_id, giver_id, token_user_id, token_user_role)
            response.send({status: 201, message: "successfull", givenScores: givenScoresData})
        } catch (error) {
            next(error)
        }
    }

    private getPersonalReceivedScoreDetail = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { project_id, receiver_id } = request.params
        const { token_user_id } = request.body

        try {
            const receivedScoresData = await this.projectService.getReceivedScoreDetailByProjectIdAndReceiverId(project_id, receiver_id, token_user_id)
            response.send({status: 201, message: "successfull", receivedScores: receivedScoresData})
        } catch (error) {
            next(error)
        }
    }

    private getUserJoinProjectByProjectId = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const project_id: string = request.params.project_id
        const user_id: string = request.body.token_user_id

        try {
            const scoreData: UserJoinProjectDto = await this.projectService.getTotalAPScore(project_id, user_id)
            response.send({status: 201, message: "successfull", score: scoreData})
        } catch (error) {
            next(error)
        }
    }

    private getUserJoinProjectByProjectIdAndUserId = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const { project_id, user_id } = request.params
        const { token_user_id,  token_user_role } = request.body

        try {
            const scoreData: UserJoinProjectDto = await this.projectService.getTotalAPScore(project_id, user_id, token_user_id, token_user_role)
            response.send({status: 201, message: "successfull", score: scoreData})
        } catch (error) {
            next(error)
        }
    }

    private getAllUserJoinProjectById = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const project_id: string = request.params.project_id
        const current_user: string = request.body.token_user_id

        try {
            const listOfScore = await this.projectService.getListTotalAPScore(project_id, current_user)
            response.send({status: 201, message: "successfull", scores: listOfScore})
        } catch (error) {
            next(error)
        }
    }

    private getAllProjectMember = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const project_id: string = request.params.project_id
        const current_user: string = request.body.token_user_id

        try {
            const listOfMember = await this.projectService.getListProjectMember(project_id, current_user)
            response.send({status: 201, message: "successfull", scores: listOfMember})
        } catch (error) {
            next(error)
        }
    }
}

export default ProjectController;