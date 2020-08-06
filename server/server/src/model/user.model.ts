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
import { UserPosition, TreeUserPosition } from "../types/userPosition";
import { USER_POSITIONS } from "../types/constants";

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

	public static async getUserPositions(
		request: RequestMessage<Array<any>>
	): Promise<ResponseMessage<UserPosition[]>> {
		const users: Array<User> = [];
		let requestCode = ResponseCode.RES_CODE_SUCCESS;

		const positions = await DBUserManager.GetAllUserPositions();

		return {
			data: positions.map((i) => i.ToRequestObject()),
			messageInfo: "SUCCESS",
			requestCode: requestCode,
		};
	}

	public static async createUser(
		request: RequestMessage<User>
	): Promise<ResponseMessage<User>> {
		let requestCode = ResponseCode.RES_CODE_SUCCESS;

		await DBUserManager.CreateUser(request.data);
		const user = await DBUserManager.GetUser(request.data.login);
		if (user !== undefined) {
			return {
				data: user?.ToRequestObject(),
				messageInfo: "SUCCESS",
				requestCode: requestCode,
			};
		}
		requestCode = ResponseCode.RES_CODE_INTERNAL_ERROR;
		return {
			data: { ...request.data, id: 0 },
			messageInfo: "ERROR",
			requestCode: requestCode,
		};
	}

	public static async getSubordinates(user: User): Promise<User[]> {
		let requestCode = ResponseCode.RES_CODE_SUCCESS;
		let usersSubordinates: User[] = [];

		const positions = await DBUserManager.GetAllUserPositions();
		const tup: TreeUserPosition = new TreeUserPosition();

		tup.fillByArray(positions.map((entity) => entity.ToRequestObject()));
		const subordinates: UserPosition[] | undefined =
			user.position.pos_id === USER_POSITIONS.COMADER
				? positions.map((u) => u.ToRequestObject())
				: tup.positions.get(user.position.pos_id);

		if (subordinates !== undefined) {
			for (const sub of subordinates) {
				const users = await DBUserManager.GetUsersByPositionId(sub.pos_id);

				usersSubordinates = usersSubordinates.concat(
					users.map((i) => i.ToRequestObject())
				);
			}
		}

		requestCode = ResponseCode.RES_CODE_INTERNAL_ERROR;
		return usersSubordinates.filter((item, index) => {
			return usersSubordinates.indexOf(item) === index;
		});
	}

	public static async updateUserPositions(
		positions: UserPosition[]
	): Promise<ResponseMessage<any>> {
		positions.forEach((pos) => {
			DBUserManager.UpdateUserPosition(pos);
		});

		return {
			data: {},
			messageInfo: "SUCCESS",
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}
}
