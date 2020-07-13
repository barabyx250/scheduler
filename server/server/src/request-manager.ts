import {
	RequestType,
	RequestMessage,
	ResponseMessage,
	ResponseCode,
} from "./types/requests";
import { UserModel } from "./model/user.model";
import { TaskModel } from "./model/task.model";
import { Task } from "./types/task";
import { logDev } from "./logger/config";
import { User } from "./types/user";
import { DBUserManager } from "./managers/db_user_manager";
import { TreeUserPosition } from "./types/userPosition";
import { DBSessionManager } from "./managers/db_session_manager";

export class RequestManager {
	public static on(socket: any, io: SocketIO.Server) {
		socket.on(RequestType.LOGIN, async (m: any) => {
			logDev.info("REQUEST: " + JSON.stringify(m));

			const request = m as RequestMessage<any>;
			const response = await UserModel.userLogin(
				request.data.username,
				request.data.password
			);

			socket.emit(RequestType.LOGIN, response);
		});

		socket.on(RequestType.CREATE_TASK, async (m: any) => {
			logDev.info("REQUEST: " + JSON.stringify(m));

			const response = await TaskModel.createTask(m);

			socket.emit(RequestType.CREATE_TASK, response);
		});

		socket.on(RequestType.GET_MY_TASKS, async (m: any) => {
			logDev.info("REQUEST: " + JSON.stringify(m));

			if ((m as RequestMessage<any>).session === "") {
				socket.emit(RequestType.GET_MY_TASKS, {
					data: [],
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<Task[]>);
				return;
			}
			const response = await TaskModel.getTasksByExecuter(m);
			socket.emit(RequestType.GET_MY_TASKS, response);
		});

		socket.on(RequestType.GET_USERS_INFO, async (m: any) => {
			logDev.info(
				`REQUEST: ${RequestType.GET_USERS_INFO} : ${JSON.stringify(m)}`
			);

			if ((m as RequestMessage<Array<number>>).session === "") {
				socket.emit(RequestType.GET_USERS_INFO, {
					data: [],
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<Task[]>);
				return;
			}

			const response = await UserModel.getUsersByIds(m);
			socket.emit(RequestType.GET_USERS_INFO, response);
		});

		socket.on(RequestType.GET_USER_POSITIONS, async (m: any) => {
			logDev.info(
				`REQUEST: ${RequestType.GET_USER_POSITIONS} : ${JSON.stringify(m)}`
			);

			if ((m as RequestMessage<Array<any>>).session === "") {
				socket.emit(RequestType.GET_USER_POSITIONS, {
					data: [],
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<Array<any>>);
				return;
			}

			const response = await UserModel.getUserPositions(m);
			socket.emit(RequestType.GET_USER_POSITIONS, response);
		});

		socket.on(RequestType.CREATE_USER, async (m: any) => {
			logDev.info(`REQUEST: ${RequestType.CREATE_USER} : ${JSON.stringify(m)}`);

			if ((m as RequestMessage<User>).session === "") {
				socket.emit(RequestType.CREATE_USER, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const response = await UserModel.createUser(m);
			socket.emit(RequestType.CREATE_USER, response);
		});

		socket.on(RequestType.GET_MY_SUBORDINATE, async (m: any) => {
			logDev.info(
				`REQUEST: ${RequestType.GET_MY_SUBORDINATE} : ${JSON.stringify(m)}`
			);

			if ((m as RequestMessage<any>).session === "") {
				socket.emit(RequestType.GET_MY_SUBORDINATE, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}
			const user = await DBUserManager.GetUserBySession(m.session);

			if (user !== undefined) {
				const response = await UserModel.getSubordinates(
					user.ToRequestObject()
				);

				socket.emit(RequestType.GET_MY_SUBORDINATE, {
					data: response,
					requestCode: ResponseCode.RES_CODE_SUCCESS,
					session: m.session,
				} as RequestMessage<User[]>);
			}

			socket.emit(RequestType.GET_MY_SUBORDINATE, {
				data: [],
				requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				session: m.session,
			} as RequestMessage<User[]>);
		});

		socket.on(RequestType.GET_TASKS_SUBORDINATES, async (m: any) => {
			logDev.info(
				`REQUEST: ${RequestType.GET_TASKS_SUBORDINATES} : ${JSON.stringify(m)}`
			);

			if ((m as RequestMessage<any>).session === "") {
				socket.emit(RequestType.GET_TASKS_SUBORDINATES, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const response = await TaskModel.getTasksBySubbordinates(m);

			socket.emit(RequestType.GET_TASKS_SUBORDINATES, response);
		});

		socket.on("disconnect", () => {
			console.log("Client disconnected");
		});
	}
}
