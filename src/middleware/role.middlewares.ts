import { UserUnauthorizedException } from '../exceptions/UserException';
import { Request, Response, NextFunction } from 'express';

const MANAGER_ROLE = "manager"
const USER_ROLE = "user"
const ADMIN_ROLE = "admin"

export async function checkManagerRole (request: Request, response: Response, next: NextFunction) {
    if (request.body.token_user_role !== MANAGER_ROLE) {
        return next(new UserUnauthorizedException())
    }
    next()
}