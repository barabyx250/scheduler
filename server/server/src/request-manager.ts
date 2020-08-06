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
import { TreeUserPosition, UserPosition } from "./types/userPosition";
import { DBSessionManager } from "./managers/db_session_manager";
import { NotificationModel } from "./model/notification.model";

export class RequestManager {
	public static m_sessionSocket: Map<string, string> = new Map<
		string,
		string
	>();

	public static on(socket: SocketIO.Socket, io: SocketIO.Server) {
		socket.use((packet: SocketIO.Packet, next: any) => {
			if (packet[1].session !== undefined) {
				this.m_sessionSocket.set(packet[1].session, socket.id);
			}
			logDev.info(`REQUEST: ${packet[0]} : ${JSON.stringify(packet)}`);
			return next();
		});

		socket.on(RequestType.LOGIN, async (m: any) => {
			const request = m as RequestMessage<any>;
			const response = await UserModel.userLogin(
				request.data.username,
				request.data.password
			);

			socket.emit(RequestType.LOGIN, response);
		});

		socket.on(RequestType.CREATE_TASK, async (m: any) => {
			const response = await TaskModel.createTask(m);
			if (response.requestCode === ResponseCode.RES_CODE_SUCCESS) {
				NotificationModel.SendCreateTaskNotification(
					response.data.executerId,
					response.data.id,
					io
				);
			}

			socket.emit(RequestType.CREATE_TASK, response);
		});

		socket.on(RequestType.GET_MY_TASKS, async (m: any) => {
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

		socket.on(RequestType.UPDATE_TASK, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				socket.emit(RequestType.UPDATE_TASK, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const response = await TaskModel.updateTasks(m);
			if (response.requestCode === ResponseCode.RES_CODE_SUCCESS) {
				NotificationModel.SendEditTaskNotification(
					response.data.executerId,
					response.data.id,
					io
				);
			}

			socket.emit(RequestType.UPDATE_TASK, response);
		});

		socket.on(RequestType.GET_TASKS_BY_ME, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				socket.emit(RequestType.GET_TASKS_BY_ME, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const response = await TaskModel.getTasksByAuthor(m);

			socket.emit(RequestType.GET_TASKS_BY_ME, response);
		});

		socket.on(RequestType.GET_MY_NOTIFICATIONS, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				socket.emit(RequestType.GET_MY_NOTIFICATIONS, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const user = await DBUserManager.GetUserBySession(m.session);
			if (user !== undefined) {
				const response = await NotificationModel.GetByRecipient(user.id);

				socket.emit(RequestType.GET_MY_NOTIFICATIONS, response);
			}
		});

		socket.on(RequestType.READ_NOTIFICATIONS, async (m: any) => {
			if ((m as RequestMessage<number[]>).session === "") {
				socket.emit(RequestType.READ_NOTIFICATIONS, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const response = await NotificationModel.Read(m.data);
			socket.emit(RequestType.READ_NOTIFICATIONS, response);
		});

		socket.on(RequestType.GET_TASKS_INFO, async (m: any) => {
			if ((m as RequestMessage<number[]>).session === "") {
				socket.emit(RequestType.GET_TASKS_INFO, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const response = await TaskModel.getTasksInfo(m);
			socket.emit(RequestType.GET_TASKS_INFO, response);
		});

		socket.on(RequestType.UPDATE_USER_POSITIONS, async (m: any) => {
			if ((m as RequestMessage<UserPosition[]>).session === "") {
				socket.emit(RequestType.UPDATE_USER_POSITIONS, {
					data: {},
					messageInfo: "Session is invalid",
					requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
				} as ResponseMessage<any>);
				return;
			}

			const response = await UserModel.updateUserPositions(m.data);
			socket.emit(RequestType.UPDATE_USER_POSITIONS, response);
		});

		socket.on("disconnect", () => {
			console.log("Client disconnected");
			for (var session of this.m_sessionSocket.keys()) {
				const socket_id = this.m_sessionSocket.get(session);
				if (socket_id === socket.id) {
					this.m_sessionSocket.delete(session);
					console.log("Removed disconnected: ", session, ":", socket_id);
				}
			}
		});
	}
}
