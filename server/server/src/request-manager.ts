import {
	RequestType,
	RequestMessage,
	ResponseMessage,
	ResponseCode,
} from "./types/requests";
import { UserModel } from "./model/user.model";
import { TaskModel } from "./model/task.model";
import { Task, TaskReport } from "./types/task";
import { logDev, LoggerInstanse } from "./logger/config";
import { User, UserRole } from "./types/user";
import { DBUserManager } from "./managers/db_user_manager";
import { UserPosition } from "./types/userPosition";
import { NotificationModel } from "./model/notification.model";
import { TaskFilters } from "./types/taskFilter";
import HashStatic from "object-hash";
import { MessageModel } from "./model/message.model";
import { AdminChat } from "./types/adminMessage";

export class RequestManager {
	public static m_sessionSocket: Map<string, string> = new Map<
		string,
		string
	>();

	public static makeid(length: number): string {
		var result = "";
		var characters =
			"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var charactersLength = characters.length;
		for (var i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	public static on(socket: SocketIO.Socket, io: SocketIO.Server) {
		socket.use((packet: SocketIO.Packet, next: any) => {
			if (packet[1].session !== undefined) {
				this.m_sessionSocket.set(packet[1].session, socket.id);
			}
			packet[1].id = (this.makeid(5) + ":" + this.makeid(8)).toUpperCase();
			LoggerInstanse.linfo(`REQUEST:`, {
				requestType: packet[0],
				requesId: packet[1].id,
				requestData: packet,
			});

			return next();
		});

		socket.on(RequestType.INIT_REQUEST, async (m: any) => {
			
			this.emit(
				RequestType.INIT_REQUEST,
				{
					data: {},
					messageInfo: "SUCCESS",
					requestCode: ResponseCode.RES_CODE_SUCCESS,
				} as ResponseMessage<any>,
				socket,
				m
			);
		});

		socket.on(RequestType.LOGIN, async (m: any) => {
			const request = m as RequestMessage<any>;
			const response = await UserModel.userLogin(
				request.data.username,
				request.data.password
			);

			this.emit(RequestType.LOGIN, response, socket, m);
		});

		socket.on(RequestType.CREATE_TASK, async (m: any) => {
			const response = await TaskModel.createTask(m);
			if (
				response.requestCode === ResponseCode.RES_CODE_SUCCESS &&
				response.data.isPrivate !== true
			) {
				NotificationModel.SendCreateTaskNotification(
					response.data.executerId,
					response.data.id,
					io
				);
			}

			this.emit(RequestType.CREATE_TASK, response, socket, m);
		});

		socket.on(RequestType.GET_MY_TASKS, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				this.emit(
					RequestType.GET_MY_TASKS,
					{
						data: [],
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<Task[]>,
					socket,
					m
				);
				return;
			}
			const response = await TaskModel.getTasksByExecuter(m);
			this.emit(RequestType.GET_MY_TASKS, response, socket, m);
		});

		socket.on(RequestType.GET_USERS_INFO, async (m: any) => {
			if ((m as RequestMessage<Array<number>>).session === "") {
				this.emit(
					RequestType.GET_USERS_INFO,
					{
						data: [],
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<Task[]>,
					socket,
					m
				);
				return;
			}

			const response = await UserModel.getUsersByIds(m);
			this.emit(RequestType.GET_USERS_INFO, response, socket, m);
		});

		socket.on(
			RequestType.GET_USER_POSITIONS,
			async (m: RequestMessage<Array<any>>) => {
				if (m.session === "") {
					this.emit(
						RequestType.GET_USER_POSITIONS,
						{
							data: [],
							messageInfo: "Session is invalid",
							requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						} as ResponseMessage<Array<any>>,
						socket,
						m
					);
					return;
				}

				const response = await UserModel.getUserPositions(m);
				this.emit(RequestType.GET_USER_POSITIONS, response, socket, m);
			}
		);

		socket.on(RequestType.CREATE_USER, async (m: any) => {
			if ((m as RequestMessage<User>).session === "") {
				this.emit(
					RequestType.CREATE_USER,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const response = await UserModel.createUser(m);
			this.emit(RequestType.CREATE_USER, response, socket, m);
		});

		socket.on(
			RequestType.GET_MY_SUBORDINATE,
			async (m: RequestMessage<any>) => {
				if (m.session === "") {
					this.emit(
						RequestType.GET_MY_SUBORDINATE,
						{
							data: {},
							messageInfo: "Session is invalid",
							requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						} as ResponseMessage<any>,
						socket,
						m
					);
					return;
				}
				const user = await DBUserManager.GetUserBySession(m.session);

				if (user !== undefined) {
					const response = await UserModel.getSubordinates(
						user.ToRequestObject()
					);

					this.emit(
						RequestType.GET_MY_SUBORDINATE,
						{
							data: response,
							requestCode: ResponseCode.RES_CODE_SUCCESS,
							session: m.session,
						} as RequestMessage<User[]>,
						socket,
						m
					);
				}

				this.emit(
					RequestType.GET_MY_SUBORDINATE,
					{
						id: m.id,
						data: [],
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						session: m.session,
					} as RequestMessage<User[]>,
					socket,
					m
				);
			}
		);

		socket.on(RequestType.GET_TASKS_SUBORDINATES, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				this.emit(
					RequestType.GET_TASKS_SUBORDINATES,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const response = await TaskModel.getTasksBySubbordinates(m);

			this.emit(RequestType.GET_TASKS_SUBORDINATES, response, socket, m);
		});

		socket.on(RequestType.UPDATE_TASK, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				this.emit(
					RequestType.UPDATE_TASK,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const response = await TaskModel.updateTasks(m);
			if (
				response.requestCode === ResponseCode.RES_CODE_SUCCESS &&
				response.data.isPrivate !== true
			) {
				NotificationModel.SendEditTaskNotification(
					response.data.executerId,
					response.data.id,
					io
				);
			}

			this.emit(RequestType.UPDATE_TASK, response, socket, m);
		});

		socket.on(RequestType.GET_TASKS_BY_ME, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				this.emit(
					RequestType.GET_TASKS_BY_ME,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const response = await TaskModel.getTasksByAuthor(m);

			this.emit(RequestType.GET_TASKS_BY_ME, response, socket, m);
		});

		socket.on(RequestType.GET_MY_NOTIFICATIONS, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				this.emit(
					RequestType.GET_MY_NOTIFICATIONS,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const user = await DBUserManager.GetUserBySession(m.session);
			if (user !== undefined) {
				const response = await NotificationModel.GetByRecipient(user.id);

				this.emit(RequestType.GET_MY_NOTIFICATIONS, response, socket, m);
			}
		});

		socket.on(RequestType.READ_NOTIFICATIONS, async (m: any) => {
			if ((m as RequestMessage<number[]>).session === "") {
				this.emit(
					RequestType.READ_NOTIFICATIONS,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const response = await NotificationModel.Read(m.data);
			this.emit(RequestType.READ_NOTIFICATIONS, response, socket, m);
		});

		socket.on(RequestType.GET_TASKS_INFO, async (m: any) => {
			if ((m as RequestMessage<number[]>).session === "") {
				this.emit(
					RequestType.GET_TASKS_INFO,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const response = await TaskModel.getTasksInfo(m);
			this.emit(RequestType.GET_TASKS_INFO, response, socket, m);
		});

		socket.on(RequestType.UPDATE_USER_POSITIONS, async (m: any) => {
			if ((m as RequestMessage<UserPosition[]>).session === "") {
				this.emit(
					RequestType.UPDATE_USER_POSITIONS,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}

			const response = await UserModel.updateUserPositions(m.data);
			this.emit(RequestType.UPDATE_USER_POSITIONS, response, socket, m);
		});

		socket.on(RequestType.GET_MY_PARENT_TASK, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				this.emit(
					RequestType.GET_MY_PARENT_TASK,
					{
						data: [],
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<Task[]>,
					socket,
					m
				);
				return;
			}
			const response = await TaskModel.getTasksByExecuter(m);
			response.data = response.data.filter((t) => t.periodParentId === t.id);
			this.emit(RequestType.GET_MY_PARENT_TASK, response, socket, m);
		});

		socket.on(RequestType.GET_COMPLITED_TASKS_BY_ME, async (m: any) => {
			if ((m as RequestMessage<any>).session === "") {
				this.emit(
					RequestType.GET_COMPLITED_TASKS_BY_ME,
					{
						data: [],
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<Task[]>,
					socket,
					m
				);
				return;
			}
			const response = await TaskModel.getComplitedTasksByExecuter(m);
			const response2 = await TaskModel.getComplitedTasksByAuthor(m);
			response2.data.forEach((element) => {
				if (response.data.find((t) => t.id === element.id) === undefined) {
					response.data.push(element);
				}
			});
			this.emit(RequestType.GET_COMPLITED_TASKS_BY_ME, response, socket, m);
		});

		socket.on(
			RequestType.FINISH_TASK,
			async (m: RequestMessage<{ id: number; report: TaskReport }>) => {
				if (m.session === "") {
					this.emit(
						RequestType.FINISH_TASK,
						{
							data: {},
							messageInfo: "Session is invalid",
							requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						} as ResponseMessage<any>,
						socket,
						m
					);
					return;
				}
				const response = await TaskModel.finishTask(m);
				this.emit(RequestType.FINISH_TASK, response, socket, m);
			}
		);

		socket.on(
			RequestType.UPDATE_USER_INFO,
			async (m: RequestMessage<Array<User>>) => {
				if (m.session === "") {
					this.emit(
						RequestType.UPDATE_USER_INFO,
						{
							data: {},
							messageInfo: "Session is invalid",
							requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						} as ResponseMessage<any>,
						socket,
						m
					);
					return;
				}
				const response = await UserModel.updateUsersInfo(m.data);
				this.emit(RequestType.UPDATE_USER_INFO, response, socket, m);
			}
		);

		socket.on(
			RequestType.SELECT_MY_TASKS_BY_FILTER,
			async (m: RequestMessage<TaskFilters>) => {
				if (m.session === "") {
					this.emit(
						RequestType.SELECT_MY_TASKS_BY_FILTER,
						{
							data: {},
							messageInfo: "Session is invalid",
							requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						} as ResponseMessage<any>,
						socket,
						m
					);
					return;
				}
				const response = await TaskModel.selectMyTasksByFilter(m);
				this.emit(RequestType.SELECT_MY_TASKS_BY_FILTER, response, socket, m);
			}
		);

		socket.on(RequestType.GET_MY_CHIEF_INFO, async (m: RequestMessage<any>) => {
			if (m.session === "") {
				this.emit(
					RequestType.GET_MY_CHIEF_INFO,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}
			const response = await UserModel.getMyChiefsInfo(m);
			this.emit(RequestType.GET_MY_CHIEF_INFO, response, socket, m);
		});

		socket.on(
			RequestType.GET_MY_EDITABLE_TASKS,
			async (m: RequestMessage<TaskFilters>) => {
				if (m.session === "") {
					this.emit(
						RequestType.GET_MY_EDITABLE_TASKS,
						{
							data: {},
							messageInfo: "Session is invalid",
							requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						} as ResponseMessage<any>,
						socket,
						m
					);
					return;
				}
				const response = await TaskModel.getMyEditableTasks(m);
				this.emit(RequestType.GET_MY_EDITABLE_TASKS, response, socket, m);
			}
		);

		socket.on(RequestType.REMOVE_TASK, async (m: RequestMessage<number>) => {
			if (m.session === "") {
				this.emit(
					RequestType.REMOVE_TASK,
					{
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>,
					socket,
					m
				);
				return;
			}
			const response = await TaskModel.removeTask(m);
			this.emit(
				RequestType.REMOVE_TASK,
				{
					data: m.data,
					messageInfo: "SUCCESS",
					requestCode: ResponseCode.RES_CODE_SUCCESS,
				} as ResponseMessage<number>,
				socket,
				m
			);
		});

		socket.on(
			RequestType.REMOVE_POSITIONS,
			async (m: RequestMessage<number[]>) => {
				if (m.session === "") {
					this.emit(
						RequestType.REMOVE_POSITIONS,
						{
							data: {},
							messageInfo: "Session is invalid",
							requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
						} as ResponseMessage<any>,
						socket,
						m
					);
					return;
				}
				const response = await UserModel.removeUserPositions(m);
				this.emit(
					RequestType.REMOVE_POSITIONS,
					{
						data: m.data,
						messageInfo: "SUCCESS",
						requestCode: ResponseCode.RES_CODE_SUCCESS,
					} as ResponseMessage<number[]>,
					socket,
					m
				);
			}
		);

		socket.on(
			RequestType.GET_ALL_USERS,
			async (m: RequestMessage<number[]>) => {
				if (m.session === "") {
					socket.emit(RequestType.GET_ALL_USERS, {
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>);
					return;
				}
				const response = await UserModel.getAllUsers(m);
				this.emit(RequestType.GET_ALL_USERS, response, socket, m);
			}
		);

		socket.on(
			RequestType.GET_COUNT_MESSAGES,
			async (
				m: RequestMessage<{ id: number; count: number; userId: number }>
			) => {
				if (m.session === "") {
					socket.emit(RequestType.GET_COUNT_MESSAGES, {
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>);
					return;
				}
				const response = await MessageModel.GetMessageCountFromMessage(m);
				this.emit(RequestType.GET_COUNT_MESSAGES, response, socket, m);
			}
		);

		socket.on(
			RequestType.SEND_MESSAGE_TO_ADMIN,
			async (m: RequestMessage<AdminChat>) => {
				if (m.session === "") {
					socket.emit(RequestType.SEND_MESSAGE_TO_ADMIN, {
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>);
					return;
				}
				const response = await MessageModel.CreateChatMessage(m);

				const currUser = await DBUserManager.GetUserBySession(m.session);
				if (
					response.requestCode === ResponseCode.RES_CODE_SUCCESS &&
					currUser !== undefined
				) {
					const usersAdmin = await UserModel.getAllAdmins({
						id: m.id,
						data: {},
						requestCode: m.requestCode,
						session: m.session,
					});
					for (const message of response.data.messages) {
						if (currUser.role === UserRole.USER) {
							NotificationModel.SendAdminTextMessageNotification(
								usersAdmin.data.map((u) => u.id),
								response.data,
								message,
								io
							); //TODO CHECK. DOES NOT SENDING NOTIFICATION. WHY?
						} else {
							NotificationModel.SendAdminTextMessageNotification(
								[response.data.withUser],
								response.data,
								message,
								io
							);
						}
					}
				}

				this.emit(RequestType.SEND_MESSAGE_TO_ADMIN, response, socket, m);
			}
		);

		socket.on(
			RequestType.GET_LAST_MESSAGES,
			async (m: RequestMessage<{ userId: number; count: number }>) => {
				if (m.session === "") {
					socket.emit(RequestType.GET_LAST_MESSAGES, {
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>);
					return;
				}
				const response = await MessageModel.GetLastMessages(m);
				this.emit(RequestType.GET_LAST_MESSAGES, response, socket, m);
			}
		);

		socket.on(
			RequestType.GET_ALL_ADMIN_CHATS,
			async (m: RequestMessage<any>) => {
				if (m.session === "") {
					socket.emit(RequestType.GET_ALL_ADMIN_CHATS, {
						data: {},
						messageInfo: "Session is invalid",
						requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
					} as ResponseMessage<any>);
					return;
				}
				const response = await MessageModel.GetAdminChats(m);
				this.emit(RequestType.GET_ALL_ADMIN_CHATS, response, socket, m);
			}
		);

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

	public static emit<T>(
		type: RequestType,
		response: T,
		socket: SocketIO.Socket,
		request: RequestMessage<any>
	) {
		socket.emit(type, response);

		LoggerInstanse.linfo(`RESPONSE:`, {
			requestType: type,
			reponseId: request.id,
			reponseData: response,
		});
	}
}
