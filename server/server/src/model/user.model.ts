import { User } from "../types/user";
import { UserEntity } from "../entities/user.entity";
import { DBUserManager } from "../managers/db_user_manager";
import {
	ResponseCode,
	ResponseMessage,
	RequestMessage,
} from "../types/requests";
import { DBSessionManager } from "../managers/db_session_manager";
import { logDev } from "../logger/config";

export class UserModel {
	public static async userLogin(
		userLogin: string,
		userPassword: string
	): Promise<ResponseMessage<User>> {
		const userEntity = await DBUserManager.GetUser(userLogin);
		if (userEntity !== undefined) {
			if (userEntity.password !== userPassword) {
				return {
					data: User.EmptyUser(),
					messageInfo: `cannot find a user ${userLogin}`,
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				};
			}
			const user = userEntity.ToRequestObject();
			const session = await DBSessionManager.CreateSession(user);
			user.session = session;
			return {
				data: user,
				messageInfo: "OK",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}
		return {
			data: User.EmptyUser(),
			messageInfo: `cannot find a user ${userLogin}`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}

	public static async getUsersByIds(
		request: RequestMessage<Array<number>>
	): Promise<ResponseMessage<User[]>> {
		const users: Array<User> = [];
		let requestCode = ResponseCode.RES_CODE_SUCCESS;

		for (var i = 0; i < request.data.length; i++) {
			const user = await DBUserManager.GetUserById(request.data[i]);
			if (user !== undefined) {
				users.push(user?.ToRequestObject());
			} else {
				logDev.error(
					"DB: ",
					new Error("Failure to find user by id: " + request.data[i])
				);
			}
		}

		return {
			data: users,
			messageInfo: "",
			requestCode: requestCode,
		};
	}
}
