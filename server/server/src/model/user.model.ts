import { User } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import { RequestMessage } from './index';
import { RequestCode } from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";


export class UserModel {
  public static async userLogin(
    userLogin: string,
    userPassword: string
  ): Promise<RequestMessage<User>> {
    const userEntity = await DBUserManager.GetUser(userLogin);
    if (userEntity !== undefined) {
        
        if (userEntity.password !== userPassword) {
            return {
                data: User.EmptyUser(),
                messageInfo: `cannot find a user ${userLogin}`,
                requestCode: RequestCode.RES_CODE_INTERNAL_ERROR
            }
        }
        const user = userEntity.ToRequestObject();
        const session = await DBSessionManager.CreateSession(user);
        user.session = session;
        return {
            data: user,
            messageInfo: "OK",
            requestCode: RequestCode.RES_CODE_SUCCESS
        }
    }
    return {
        data: User.EmptyUser(),
        messageInfo: `cannot find a user ${userLogin}`,
        requestCode: RequestCode.RES_CODE_INTERNAL_ERROR
    };
  }
}
