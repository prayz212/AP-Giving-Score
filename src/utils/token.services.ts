import * as jwt from 'jsonwebtoken';
import User from '../user/user.entity';
import { TokenAuthenticateData, TokenResetPasswordData, AuthenticateDataStoredIntoken } from '../interfaces/token.interface';

class TokenServices {
    private tokenSecret = process.env.JWT_SECRET || 'qwerty';
    private refreshTokenSecret = process.env.JWT_SECRET || 'qwerty';

    public createAuthenticateToken(user: User, type: string, expiresTime = 60*60): TokenAuthenticateData {
        const expiresIn = expiresTime;
        const dataStoredInToken: AuthenticateDataStoredIntoken = {
            id: user.id,
            type
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, this.tokenSecret, {
                algorithm: "HS256",
                expiresIn
            }),
            refreshToken: jwt.sign(dataStoredInToken, this.refreshTokenSecret, {
                algorithm: "HS256",
                expiresIn
            })
        }
    }

    public createResetPasswordToken(user: User, type: string, expiresTime = 60*5): TokenResetPasswordData {
        const expiresIn = expiresTime;
        const dataStoredInToken: AuthenticateDataStoredIntoken = {
            id: user.id,
            type
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, this.tokenSecret, {
                algorithm: "HS256",
                expiresIn
            })
        }
    }
}

export default TokenServices
