import {getRepository} from 'typeorm'
import Project from './project.entity'
import { CreateProjectDto, 
         DeleteProjectDto, 
         NewGivingScoreDto, 
         PostGivingScoreDto, 
         ProjectDto, 
         RemoveUserToProjectDto, 
         UserJoinProjectDto
        } from './project.dto'
import { ProjectWithThatIDAlreadyFinishedException, 
         ProjectWithThatIDNotExistsException, 
         UserJoiningProjectNotExistsException,
         ProjectWithThatUserAlreadyExistException,
         InvalidRatingException } from '../exceptions/ProjectException'
import User from '../user/user.entity'
import { UserUnauthorizedException, UserWithThatIdNotActiveException, 
         UserWithThatIdNotExistsException } from '../exceptions/UserException'
import UserJoinProject from './userJoinProject.entity'
import ScoreGiven from './scoreGiven.entity'
import { ReceiverWithThatIdAlreadyExistsException, 
         ReceiverWithThatIdNotExistsException,
         CanNotGivingScoreToItselfException} from '../exceptions/GivingScoreException'

const MANAGER_ROLE = 'manager'
const ADMIN_ROLE = 'admin'
const USER_ROLE = 'user'

class ProjectServices {
    private projectRepository = getRepository(Project)
    private userRepository = getRepository(User)
    private userJoinProjectRepository = getRepository(UserJoinProject)
    private scoreGivenRepository = getRepository(ScoreGiven)

    public getProjectListUserJoined =  async (userId: string) => {
        const projects: UserJoinProject[] = await this.userJoinProjectRepository.createQueryBuilder("user_join_project")
            .innerJoinAndSelect("user_join_project.project", "project")
            .select("user_join_project.project_id", 'id')
            .addSelect("project.name", "name")
            .where('user_join_project.user_id = :userId', {userId})
            .andWhere('user_join_project.IsDeleted = false')
            .andWhere('project.IsDeleted = false')
            .getRawMany()
        return projects
    }

    public getProjectListManagerCreated =  async (userId: string) => {
        const projects: Project[] = await this.projectRepository.find({where: {created_user: userId, IsDeleted: false}, select: ["id", "name"]})
        return projects
    }

    public getProject =  async (projectId: string, userId: string, userRole: string) => {
        if (userRole === MANAGER_ROLE) await this.checkProjectCreator(projectId, userId)
        else await this.checkProjectMember(projectId, userId)
        const project: Project = await this.projectRepository.findOne({where: {id: projectId, IsDeleted: false}, select: ["id", "name", "description", "start_date", "end_date", "IsFinished"]})
        if (!project) {
            throw new ProjectWithThatIDNotExistsException(projectId);
        }
        return project
    }

    public createNewProject = async (currentUser: string, projectInfo: CreateProjectDto) => {
        const userIdsInMemberList: string[] = projectInfo.member_list.map(member => {
            return member.user_id
        })
        const userIds: User[] = await this.userRepository.find({ select: ["id"], where: {IsActive: true, IsDeleted: false} })
        const db: string[] = userIds.map(userId => {
            return userId.id
        })
        await this.validationUser(userIdsInMemberList, db)

        const newProject: Project = this.projectRepository.create({
            name: projectInfo.name,
            description: projectInfo.description,
            start_date: projectInfo.start_date,
            end_date: projectInfo.end_date,
            created_user: currentUser,
            updated_user: currentUser
        });
        const {id} = await this.projectRepository.save(newProject)
        const now = new Date().toISOString()
        
        const newUsersJoinProject: UserJoinProject[] = projectInfo.member_list.map(element => {
            const newUserJoinProject = this.userJoinProjectRepository.create({
                ...element, project_id: id, IsDeleted: false, created_at: now, updated_at: now, created_user: currentUser, updated_user: currentUser
            })
            return newUserJoinProject
        })
        await this.userJoinProjectRepository.save(newUsersJoinProject)
    }

    public updateProject = async (currentUser: string, projectData: ProjectDto) => {
        const projectNeedToUpdate: Project = await this.projectRepository.findOne({where: {id: projectData.id, IsDeleted: false, created_user: currentUser}});
        if (!projectNeedToUpdate) {
            throw new ProjectWithThatIDNotExistsException(projectData.id);
        }
        const updatedProject: Project = await this.projectRepository.save({
			...projectNeedToUpdate,
			name: projectData.name,
            description: projectData.description,
            start_date: projectData.start_date,
            end_date: projectData.end_date,
            IsFinished: projectData.IsFinished
		})
        delete updatedProject.created_at
        delete updatedProject.updated_at
        delete updatedProject.IsDeleted
        delete updatedProject.created_user
        delete updatedProject.updated_user
        return updatedProject
    }

    public deleteProject = async (currentUser: string, projectId: DeleteProjectDto) => {
        const projectNeedToDelete: Project = await this.projectRepository.findOne({id: projectId.id, created_user: currentUser, IsDeleted: false});
        if (!projectNeedToDelete) {
            throw new ProjectWithThatIDNotExistsException(projectId.id);
        }

        const usersJoinedProject: UserJoinProject[] = await this.userJoinProjectRepository.find({project_id: projectId.id, created_user: currentUser})
        const deleteUsersJoinedProject: UserJoinProject[] = usersJoinedProject.map(userJoinedProject => {
            userJoinedProject.IsDeleted = true
            return userJoinedProject
        })
        await this.userJoinProjectRepository.save(deleteUsersJoinedProject)

        projectNeedToDelete.IsDeleted = true
        await this.projectRepository.save(projectNeedToDelete)
    }

    public inviteUser = async (currentUser: string, information: UserJoinProjectDto) => {
        const user: User = await this.userRepository.findOne(information.user_id)
        if (!user || user.IsDeleted) {
            throw new UserWithThatIdNotExistsException(information.user_id)
        } else if (!user.IsActive) {
            throw new UserWithThatIdNotActiveException(user.id)
        }

        const project: Project = await this.projectRepository.findOne({where: {id: information.project_id, created_user: currentUser}})
        if (!project || project.IsDeleted) {
            throw new ProjectWithThatIDNotExistsException(information.project_id)
        } else if (project.IsFinished) {
            throw new ProjectWithThatIDAlreadyFinishedException(project.id)
        } 

        const userInviteToProject: UserJoinProject = await this.userJoinProjectRepository.findOne({user_id: information.user_id, project_id: information.project_id})
        if (userInviteToProject && !userInviteToProject.IsDeleted) {
            throw new ProjectWithThatUserAlreadyExistException(information.project_id, information.user_id)
        } 

        const newUserJoinProject: UserJoinProject = this.userJoinProjectRepository.create({
			...information,
            IsDeleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_user: currentUser,
            updated_user: currentUser
		});
        const addNewUserToProjectResult: UserJoinProject = await this.userJoinProjectRepository.save(newUserJoinProject)
        delete addNewUserToProjectResult.created_at
        delete addNewUserToProjectResult.updated_at
        delete addNewUserToProjectResult.IsDeleted
        delete addNewUserToProjectResult.created_user
        delete addNewUserToProjectResult.updated_user
        return addNewUserToProjectResult
    }

    public removeUser = async (currentUser: string, information: RemoveUserToProjectDto) => {
        const project: Project = await this.projectRepository.findOne({where: {id: information.project_id, created_user: currentUser}})
        if (!project || project.IsDeleted) {
            throw new ProjectWithThatIDNotExistsException(information.project_id)
        } else if (project.IsFinished) {
            throw new ProjectWithThatIDAlreadyFinishedException(project.id)
        } 

        const user: User = await this.userRepository.findOne(information.user_id)
        if (!user || user.IsDeleted) {
            throw new UserWithThatIdNotExistsException(information.user_id)
        } else if (!user.IsActive) {
            throw new UserWithThatIdNotActiveException(user.id)
        }

        const projectRemoveUser: UserJoinProject = await this.userJoinProjectRepository.findOne({project_id: information.project_id, user_id: information.user_id, created_user: currentUser, IsDeleted: false})
        if (!projectRemoveUser) {
            throw new UserJoiningProjectNotExistsException(information.user_id, information.project_id)
        }

        projectRemoveUser.IsDeleted = true
        await this.userJoinProjectRepository.save(projectRemoveUser)
    }

    public updateUser = async (currentUser: string, information: UserJoinProjectDto) => {
        const project: Project = await this.projectRepository.findOne({where: {id: information.project_id, created_user: currentUser}})
        if (!project || project.IsDeleted) {
            throw new ProjectWithThatIDNotExistsException(information.project_id)
        } else if (project.IsFinished) {
            throw new ProjectWithThatIDAlreadyFinishedException(project.id)
        }

        const user: User = await this.userRepository.findOne(information.user_id)
        if (!user || user.IsDeleted) {
            throw new UserWithThatIdNotExistsException(information.user_id)
        } else if (!user.IsActive) {
            throw new UserWithThatIdNotActiveException(user.id)
        }

        const projectUpdateInformation: UserJoinProject = await this.userJoinProjectRepository.findOne({project_id: information.project_id, user_id: information.user_id, created_user: currentUser, IsDeleted:  false})
        if (!projectUpdateInformation) {
            throw new UserJoiningProjectNotExistsException(information.user_id, information.project_id)
        }

        projectUpdateInformation.total_ap_score = information.total_ap_score
        const updatedProjectInformation: UserJoinProject = await this.userJoinProjectRepository.save(projectUpdateInformation)
        delete updatedProjectInformation.created_at
        delete updatedProjectInformation.updated_at
        delete updatedProjectInformation.IsDeleted
        delete updatedProjectInformation.created_user
        delete updatedProjectInformation.updated_user
        return updatedProjectInformation
    }

    public addNewGivingScore = async (giver_user_id: string, givingScoreData: NewGivingScoreDto) => {
        const project: Project = await this.projectRepository.findOne({id: givingScoreData.project_id})
        if (!project || project.IsDeleted) {
            throw new ProjectWithThatIDNotExistsException(givingScoreData.project_id)
        } else if (project.IsFinished) {
            throw new ProjectWithThatIDAlreadyFinishedException(project.id)
        } 

        const checkGiverInUserTable: User = await this.userRepository.findOne({id: giver_user_id, IsDeleted: false})
        if (!checkGiverInUserTable) {
            throw new UserWithThatIdNotExistsException(giver_user_id)
        } else if (!checkGiverInUserTable.IsActive) {
            throw new UserWithThatIdNotActiveException(checkGiverInUserTable.id)
        }

        await this.checkProjectMember(givingScoreData.project_id, giver_user_id)

        const receiverIdsInScoreList: string[] = givingScoreData.score_list.map(score => {
            return score.receiver_user_id
        })
        const receiversJoinProject: UserJoinProject[] = await this.userJoinProjectRepository.find({ select: ["user_id"], where: {project_id: givingScoreData.project_id, IsDeleted: false} })
        const receiverIdsInDB: string[] = receiversJoinProject.map(receiver => {
            return receiver.user_id
        })
        await this.validationUser(receiverIdsInScoreList, receiverIdsInDB)

        const checkGiverAndReceiver = givingScoreData.score_list.some(score => {
            return score.receiver_user_id == giver_user_id
        })
        if (checkGiverAndReceiver) throw new CanNotGivingScoreToItselfException()

        const givingScores: ScoreGiven[] = await this.scoreGivenRepository.find({select: ["receiver_user_id"], where: {project_id: givingScoreData.project_id, giver_user_id, IsDeleted: false}})
        this.checkExistScoreGiven(givingScoreData.score_list, givingScores)
        this.validationRating(givingScoreData.score_list)        

        const newGivingScores: ScoreGiven[] = givingScoreData.score_list.map(score => {
            const scoreGiven: ScoreGiven = this.scoreGivenRepository.create({
                ...score,
                project_id: givingScoreData.project_id, 
                giver_user_id,
                IsDeleted: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            return scoreGiven
        })
        await this.scoreGivenRepository.save(newGivingScores)
    }

    public getGivenScoreDetailByProjectIdAndGiverId = async (project_id: string, giver_user_id: string, currentUser: string, currentUserRole: string) => {
        if (currentUserRole === MANAGER_ROLE) await this.checkProjectCreator(project_id, currentUser) 
        else await this.checkProjectMember(project_id, currentUser)

        const result: ScoreGiven[] = await this.scoreGivenRepository.createQueryBuilder("score_given")
            .innerJoinAndSelect("score_given.receiver", "user")
            .select("user.fullName", "fullName")
            .addSelect("user.id", "userId")
            .addSelect("score_given.project_id", "projectId")
            .addSelect("score_given.productivity", "productivity")
            .addSelect("score_given.quality", "quality")
            .addSelect("score_given.accountability", "accountability")
            .addSelect("score_given.supportiveness", "supportiveness")
            .addSelect("score_given.strength", "strength")
            .addSelect("score_given.constructive_feedback", "constructiveFeedback")
            .addSelect("score_given.given_ap_score", "GivenAPScore")
            .where('score_given.project_id = :project_id', {project_id})
            .andWhere('score_given.giver_user_id = :giver_user_id', {giver_user_id})
            .andWhere('score_given.IsDeleted = false')
            .andWhere('user.IsDeleted = false')
            .getRawMany()

        return result 
    }

    public getReceivedScoreDetailByProjectIdAndReceiverId = async (project_id: string, receiver_user_id: string, currentUser: string) => {
        await this.checkProjectCreator(project_id, currentUser)

        const result: ScoreGiven[] = await this.scoreGivenRepository.createQueryBuilder("score_given")
            .innerJoinAndSelect("score_given.giver", "user")
            .select("user.fullName", "fullName")
            .addSelect("user.id", "userId")
            .addSelect("score_given.project_id", "projectId")
            .addSelect("score_given.productivity", "productivity")
            .addSelect("score_given.quality", "quality")
            .addSelect("score_given.accountability", "accountability")
            .addSelect("score_given.supportiveness", "supportiveness")
            .addSelect("score_given.strength", "strength")
            .addSelect("score_given.constructive_feedback", "constructiveFeedback")
            .addSelect("score_given.given_ap_score", "GivenAPScore")
            .where('score_given.project_id = :project_id', {project_id})
            .andWhere('score_given.receiver_user_id = :receiver_user_id', {receiver_user_id})
            .andWhere('user.IsDeleted = false')
            .andWhere('score_given.IsDeleted = false')
            .getRawMany()

        return result
    }

    public getTotalAPScore = async (project_id: string, user_id: string, current_user: string = undefined, current_user_role: string = USER_ROLE) => {
        if (current_user && current_user_role === MANAGER_ROLE) await this.checkProjectCreator(project_id, current_user) 
        else await this.checkProjectMember(project_id, user_id)
        
        const scoreData: UserJoinProject = await this.userJoinProjectRepository.findOne({where: {project_id, user_id, IsDeleted: false}, select: ["user_id", "total_ap_score"]})
        if (!scoreData) {
            throw new UserJoiningProjectNotExistsException(user_id, project_id)
        }

        return scoreData
    }

    public getListTotalAPScore = async (project_id: string, current_user: string) => {
        await this.checkProjectCreator(project_id, current_user)

        const result = await this.userRepository.createQueryBuilder("user")
            .innerJoin(
                    UserJoinProject, 
                    "user_join_project",
                    'user_join_project.user_id = user.id AND user_join_project.IsDeleted = false'
                )
            .leftJoin(
                    ScoreGiven, 
                    'score_given', 
                    'score_given.project_id = user_join_project.project_id AND score_given.receiver_user_id = user_join_project.user_id AND score_given.IsDeleted = false'
                )
            .select("user.fullName", "fullName")
            .addSelect("user.id", "userId") 
            .addSelect("user_join_project.total_ap_score", "totalAPScore")
            .addSelect(`CASE WHEN SUM("score_given"."given_ap_score") IS NULL THEN 0 ELSE SUM("score_given"."given_ap_score") END`, "totalReceivedScore")
            .where('user_join_project.project_id = :project_id', {project_id})
            .andWhere('user.IsDeleted = false')
            .andWhere('user_join_project.IsDeleted = false')
            .groupBy('"userId"')
            .addGroupBy('"fullName"')
            .addGroupBy('"totalAPScore"')
            .getRawMany()

        return result
    }

    public getListProjectMember = async (project_id: string, current_user: string) => {
        await this.checkProjectMember(project_id, current_user)

        const members: User[] = await this.userRepository.createQueryBuilder("user")
            .innerJoinAndSelect("user.usersJoinProject", "user_join_project")
            .select("user.fullName", "fullName")
            .addSelect("user.id", "id") 
            .where('user_join_project.project_id = :project_id', {project_id})
            .andWhere('user.id != :user_id', {user_id: current_user})
            .andWhere('user.IsDeleted = false')
            .andWhere('user_join_project.IsDeleted = false')
            .getRawMany()

        return members
    }

    private validationRating = (scores: PostGivingScoreDto[]) => {
        for (let score of scores) {
            if (!this.isValidRating(score.productivity) || 
                !this.isValidRating(score.quality) || 
                !this.isValidRating(score.accountability) ||
                !this.isValidRating(score.supportiveness)) {
                throw new InvalidRatingException()        
            }
        }
    }

    private validationUser = async (ids: string[], db: string[]) => {
        for (let id of ids) {
            if (!db.includes(id)) {
                throw new ReceiverWithThatIdNotExistsException(id)
            }
        }
    }

    private checkExistScoreGiven = (receivers_id: PostGivingScoreDto[], scores: ScoreGiven[]) => {
        const ids: string[] = scores.map(score => {
            return score.receiver_user_id
        })

        for (let receiver of receivers_id) {
            if (ids.includes(receiver.receiver_user_id)) {
                throw new ReceiverWithThatIdAlreadyExistsException(receiver.receiver_user_id)
            }
        }
    }

    private isValidRating = (criteria: number) => {
        return criteria > 0 && criteria <= 5
    }

    private checkProjectCreator = async (project_id: string, creator_id: string) => {
        const isProjectCreator: Project = await this.projectRepository.findOne({where: {id: project_id, created_user: creator_id, IsDeleted: false}})
        if (!isProjectCreator) {
            throw new UserUnauthorizedException()
        }
    }

    private checkProjectMember = async (project_id: string, member_id: string) => {
        const isProjectMember: UserJoinProject = await this.userJoinProjectRepository.findOne({where: {project_id, user_id: member_id, IsDeleted: false}})
        if (!isProjectMember) {
            throw new UserUnauthorizedException()
        }
    }
}

export default ProjectServices;