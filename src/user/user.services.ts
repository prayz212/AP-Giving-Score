import {getRepository} from 'typeorm';
import { UserDto } from './user.dto';
import User from './user.entity';

class UserServices {
	private userRepository = getRepository(User);

	public getUserList =  async () => {
        const users: UserDto[] = await this.userRepository.find({where: {IsDeleted: false, IsActive: true}, select: ["id", "fullName", "email", "role"]})
        return users
    }
}

export default UserServices;
