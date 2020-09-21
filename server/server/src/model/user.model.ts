import { User, UserRole } from "../types/user";
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
import { USER_POSITIONS, EMPTY_POSITION_ID } from "../types/constants";

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

	public static async getAllUsers(
		request: RequestMessage<any>
	): Promise<ResponseMessage<User[]>> {
		let requestCode = ResponseCode.RES_CODE_SUCCESS;

		const user = await DBUserManager.GetAllUsers();

		return {
			data: user.map((u) => u.ToRequestObject()),
			messageInfo: "",
			requestCode: requestCode,
		};
	}

	public static async getAllAdmins(
		request: RequestMessage<any>
	): Promise<ResponseMessage<User[]>> {
		let requestCode = ResponseCode.RES_CODE_SUCCESS;

		const user = (await DBUserManager.GetAllUsers()).filter(
			(u) => u.role === UserRole.ADMIN
		);

		return {
			data: user.map((u) => u.ToRequestObject()),
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
		let subordinates: UserPosition[] | undefined =
			user.position.pos_id === USER_POSITIONS.COMADER
				? positions.map((u) => u.ToRequestObject())
				: tup.positions.get(user.position.pos_id);

		const getChildOfSubbordinates = (subs: UserPosition[]) => {
			let result = subs.concat([]);
			subs.forEach((s) => {
				const poss = tup.positions.get(s.pos_id);
				if (poss) result = result.concat(getChildOfSubbordinates(poss));
			});
			return result;
		};

		if (
			subordinates !== undefined &&
			user.position.pos_id !== USER_POSITIONS.COMADER
		) {
			subordinates = getChildOfSubbordinates(subordinates);
		}

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

	public static async isPositionAboveOrEqual(
		one: UserPosition,
		two: UserPosition
	): Promise<boolean> {
		//console.log("compare positions", one, two);

		if (one.pos_id === two.pos_id) return true;
		if (one.parent_id === two.pos_id) return false;

		const positions = await DBUserManager.GetAllUserPositions();
		const tup: TreeUserPosition = new TreeUserPosition();

		tup.fillByArray(positions.map((entity) => entity.ToRequestObject()));

		const parentSearchF = (p_id: number): UserPosition => {
			const pos = tup.findPossById(p_id);
			if (pos.pos_id !== two.pos_id && pos.pos_id > 0) {
				return parentSearchF(pos.parent_id);
			}

			return {
				name: "",
				parent_id: 0,
				pos_id: 0,
			};
		};

		const res = parentSearchF(one.parent_id);

		return res.name === "";
	}

	public static async updateUsersInfo(
		users: User[]
	): Promise<ResponseMessage<any>> {
		for (const user of users) {
			const userEntity = await DBUserManager.GetUserById(user.id);

			if (userEntity) {
				if (user.login !== "") userEntity.login = user.login;

				if (user.firstName !== "") userEntity.firstName = user.firstName;

				if (user.secondName !== "") userEntity.secondName = user.secondName;

				if (user.middleName !== "") userEntity.middleName = user.middleName;

				if (user.password !== "") userEntity.password = user.password;

				if (user.position.pos_id >= 0)
					userEntity.position = await DBUserManager.GetUserPositionsById(
						user.position.pos_id
					);

				DBUserManager.UpdateUserInfo(userEntity);
			}
		}

		return {
			data: {},
			messageInfo: "SUCCESS",
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}

	public static async getMyChiefsInfo(
		request: RequestMessage<any>
	): Promise<ResponseMessage<User[]>> {
		const user = await DBUserManager.GetUserBySession(request.session);

		if (user) {
			const chiefs = await DBUserManager.GetUserChiefs(user.id);

			return {
				data: chiefs.map((ch) => ch.ToRequestObject()),
				messageInfo: "SUCCESS",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: [],
			messageInfo: "FAILUTRE",
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}

	public static async removeUserPositions(
		request: RequestMessage<number[]>
	): Promise<any> {
		for (const posId of request.data) {
			const userEntities = await DBUserManager.GetUsersByPositionId(posId);
			const emptyPositionEntity = await DBUserManager.GetUserPositionsById(
				EMPTY_POSITION_ID
			);
			if (emptyPositionEntity) {
				for (const userEntity of userEntities) {
					userEntity.position = emptyPositionEntity;
					await DBUserManager.UpdateUserInfo(userEntity);
				}
				await DBUserManager.RemoveUserPosition(posId);
			}
		}

		return {
			data: [],
			messageInfo: "FAILUTRE",
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}

	public static async checkInstallEmptyPosition() {
		const position = await DBUserManager.GetUserPositionsById(
			EMPTY_POSITION_ID
		);
		if (position === undefined) {
			DBUserManager.CreateEmptyPosition();
		}
	}
}
