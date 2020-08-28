import {
	ResponseCode,
	ResponseMessage,
	RequestMessage,
} from "../types/requests";
import { NotificationItem, NotificationType } from "../types/notification";
import { DBUserManager } from "../managers/db_user_manager";
import { DBNotificationManager } from "../managers/db_notification_manager";
import { DBSessionManager } from "../managers/db_session_manager";
import { RequestManager } from "../request-manager";
import { DBTaskManager } from "../managers/db_task_manager";
import { RequestType } from "../types/requests";
import { User } from "../types/user";
import {
	TEN_PERCENT_OF_DAY,
	TEN_MINUTES_IN_MILLISECONDS,
} from "../types/constants";
import { TaskStatus } from "../types/task";
import {
	addDays,
	startOfDay,
	endOfDay,
	startOfTomorrow,
	endOfTomorrow,
} from "date-fns";
import { logDev } from "../logger/config";
import moment from "moment";

export class NotificationModel {
	public static async GetByRecipient(
		userId: number
	): Promise<ResponseMessage<NotificationItem[]>> {
		const nots = await DBNotificationManager.GetByUserTo(userId);

		return {
			data: nots.map((n) => n.ToRequestObject()),
			messageInfo: `cannot find a user ${userId}`,
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}

	public static async Read(ids: number[]): Promise<ResponseMessage<number[]>> {
		ids.forEach((id) => DBNotificationManager.Read(id));

		return {
			data: ids,
			messageInfo: `SUCCESS`,
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}

	public static async SendCreateTaskNotification(
		recipientId: number,
		taskId: number,
		io: SocketIO.Server
	) {
		const task = await DBTaskManager.GetTaskById(taskId);
		if (task !== undefined) {
			const notItem: NotificationItem = {
				content: `На вас була назначена задача: \n${task.title}`,
				dateCreation: new Date(),
				customData: JSON.stringify(task.ToRequestObject()),
				from_id: task.userAuthor.id,
				to_id: task.userExecuter.id,
				id: 0,
				title: "Нова задача",
				type: NotificationType.TASK_CREATE,
				wasSend: false,
			};
			NotificationModel.SendNotificationToUser(recipientId, notItem, io);

			const chiefs = await DBUserManager.GetUserChiefs(recipientId);
			const chiefTaskAuthor = chiefs.find((ch) => ch.id === task.userAuthor.id);
			if (chiefTaskAuthor === undefined) {
				for (var chief of chiefs) {
					const chiefNotItem: NotificationItem = {
						content: `На користувача ${User.GetUserPIB(
							task.userExecuter.ToRequestObject()
						)} була назначена задача: \n${task.title}`,
						dateCreation: new Date(),
						customData: JSON.stringify(task.ToRequestObject()),
						from_id: task.userAuthor.id,
						to_id: chief.id,
						id: 0,
						title: "Нова задача на вашого підлеглого",
						type: NotificationType.TASK_CREATE,
						wasSend: false,
					};
					NotificationModel.SendNotificationToUser(chief.id, chiefNotItem, io);
				}
			}
		}
	}

	public static async SendEditTaskNotification(
		recipientId: number,
		taskId: number,
		io: SocketIO.Server
	) {
		const task = await DBTaskManager.GetTaskById(taskId);
		if (task !== undefined) {
			const notItem: NotificationItem = {
				content: `Задача: "${task.title}" була оновлена`,
				dateCreation: new Date(),
				customData: JSON.stringify(task.ToRequestObject()),
				from_id: task.userAuthor.id,
				to_id: task.userExecuter.id,
				id: 0,
				title: "Оновлена задача",
				type: NotificationType.TASK_EDIT,
				wasSend: false,
			};
			NotificationModel.SendNotificationToUser(recipientId, notItem, io);

			const chiefs = await DBUserManager.GetUserChiefs(recipientId);
			const chiefTaskAuthor = chiefs.find((ch) => ch.id === task.userAuthor.id);
			if (chiefTaskAuthor === undefined) {
				for (var chief of chiefs) {
					const chiefNotItem: NotificationItem = {
						content: `Задача "${
							task.title
						}" вашого відлеглого ${User.GetUserPIB(
							task.userExecuter.ToRequestObject()
						)} була оновлена користувачем ${User.GetUserPIB(
							chief.ToRequestObject()
						)}`,
						dateCreation: new Date(),
						customData: JSON.stringify(task.ToRequestObject()),
						from_id: task.userAuthor.id,
						to_id: chief.id,
						id: 0,
						title: `Оновлення задачі вашого підлеглого`,
						type: NotificationType.TASK_EDIT,
						wasSend: false,
					};
					NotificationModel.SendNotificationToUser(chief.id, chiefNotItem, io);
				}
			}
		}
	}

	public static async SendNotificationToUser(
		recipientId: number,
		notificationItem: NotificationItem,
		io: SocketIO.Server
	) {
		const sessions = await DBSessionManager.GetSessionsByUserId(recipientId);

		for (var session of sessions) {
			if (RequestManager.m_sessionSocket.has(session.session)) {
				const socketId = RequestManager.m_sessionSocket.get(session.session);
				if (socketId) {
					const socket = io.sockets.sockets[socketId];
					notificationItem.wasSend = true;
					socket.emit(RequestType.NOTIFICATION, notificationItem);
				}
			}
		}

		DBNotificationManager.Create(notificationItem);
	}

	public static async StartTaskProgressNotification(io: SocketIO.Server) {
		setInterval(async () => {
			const tasks = await DBTaskManager.GetTasksByStatus(
				TaskStatus.IN_PROGRESS
			);
			const currTime = new Date().getTime();
			for (var task of tasks) {
				const taskTimeDuration =
					new Date(task.endDate).getTime() - new Date(task.startDate).getTime();
				const currTimeDuration = currTime - new Date(task.startDate).getTime();
				if (currTimeDuration > 0) {
					if (!task.flags.isFifteenPrecentProgress) {
						if (
							(task.flags.isFifteenPrecentProgress =
								currTimeDuration > taskTimeDuration / 2)
						) {
							const notItem: NotificationItem = {
								content: `Термін задачи: "${task.title}" менше, ніж 50%`,
								dateCreation: new Date(),
								customData: JSON.stringify(task.ToRequestObject()),
								from_id: task.userAuthor.id,
								to_id: task.userExecuter.id,
								id: 0,
								title: "Сповіщення про термін задачі",
								type: NotificationType.SYSTEM,
								wasSend: false,
							};
							NotificationModel.SendNotificationToUser(
								task.userExecuter.id,
								notItem,
								io
							);

							if (task.userAuthor.id !== task.userExecuter.id) {
								const chiefNotItem: NotificationItem = {
									content: `Термін задачі "${
										task.title
									}" вашого відлеглого ${User.GetUserPIB(
										task.userExecuter.ToRequestObject()
									)} менше, ніж 50%`,
									dateCreation: new Date(),
									customData: JSON.stringify(task.ToRequestObject()),
									from_id: task.userAuthor.id,
									to_id: task.userAuthor.id,
									id: 0,
									title: `Сповіщення про термін задачі вашого підлеглого`,
									type: NotificationType.SYSTEM,
									wasSend: false,
								};
								NotificationModel.SendNotificationToUser(
									task.userAuthor.id,
									chiefNotItem,
									io
								);
							}
						}
					} else if (!task.flags.isTwentyFivePrecentProgress) {
						const twentyFivePercentTime = (taskTimeDuration * 75) / 100;
						if (
							(task.flags.isTwentyFivePrecentProgress =
								currTimeDuration > twentyFivePercentTime)
						) {
							const notItem: NotificationItem = {
								content: `Термін задачи: "${task.title}" менше, ніж 25%`,
								dateCreation: new Date(),
								customData: JSON.stringify(task.ToRequestObject()),
								from_id: task.userAuthor.id,
								to_id: task.userExecuter.id,
								id: 0,
								title: "Сповіщення про термін задачі",
								type: NotificationType.SYSTEM,
								wasSend: false,
							};
							NotificationModel.SendNotificationToUser(
								task.userExecuter.id,
								notItem,
								io
							);
							if (task.userAuthor.id !== task.userExecuter.id) {
								const chiefNotItem: NotificationItem = {
									content: `Термін задачі "${
										task.title
									}" вашого відлеглого ${User.GetUserPIB(
										task.userExecuter.ToRequestObject()
									)} менше, ніж 25%`,
									dateCreation: new Date(),
									customData: JSON.stringify(task.ToRequestObject()),
									from_id: task.userAuthor.id,
									to_id: task.userAuthor.id,
									id: 0,
									title: `Сповіщення про термін задачі вашого підлеглого`,
									type: NotificationType.SYSTEM,
									wasSend: false,
								};
								NotificationModel.SendNotificationToUser(
									task.userAuthor.id,
									chiefNotItem,
									io
								);
							}
						}
					} else if (!task.flags.isTenPrecentProgress) {
						const tenPercentTime = (taskTimeDuration * 90) / 100;
						if (
							(task.flags.isTenPrecentProgress =
								currTimeDuration > tenPercentTime)
						) {
							const notItem: NotificationItem = {
								content: `Термін задачи: "${task.title}" менше, ніж 10%`,
								dateCreation: new Date(),
								customData: JSON.stringify(task.ToRequestObject()),
								from_id: task.userAuthor.id,
								to_id: task.userExecuter.id,
								id: 0,
								title: "Сповіщення про термін задачі",
								type: NotificationType.SYSTEM,
								wasSend: false,
							};
							NotificationModel.SendNotificationToUser(
								task.userExecuter.id,
								notItem,
								io
							);
							if (task.userAuthor.id !== task.userExecuter.id) {
								const chiefNotItem: NotificationItem = {
									content: `Термін задачі "${
										task.title
									}" вашого відлеглого ${User.GetUserPIB(
										task.userExecuter.ToRequestObject()
									)} менше, ніж 10%`,
									dateCreation: new Date(),
									customData: JSON.stringify(task.ToRequestObject()),
									from_id: task.userAuthor.id,
									to_id: task.userAuthor.id,
									id: 0,
									title: `Сповіщення про термін задачі вашого підлеглого`,
									type: NotificationType.SYSTEM,
									wasSend: false,
								};
								NotificationModel.SendNotificationToUser(
									task.userAuthor.id,
									chiefNotItem,
									io
								);
							}
						}
					}
					DBTaskManager.UpdateTaskFlags(task.flags);
				}
			}
		}, 5000);
	}

	public static async StartTomorrowTaskNotification(io: SocketIO.Server) {
		setInterval(async () => {
			const tommorowDateStart = startOfTomorrow();
			const tommorowDateEnd = endOfTomorrow();

			// console.log(
			// 	"GET TASK BETWEEN DATES: ",
			// 	tommorowDateStart,
			// 	tommorowDateEnd
			// );

			const tasks = await DBTaskManager.GetTasksStartBetweenDates(
				tommorowDateStart,
				tommorowDateEnd
			);
			for (var task of tasks) {
				if (!task.flags.isNotificationForStartWas) {
					const notItem: NotificationItem = {
						content: `Завтра початок виконання задачі: "${task.title}"`,
						dateCreation: new Date(),
						customData: JSON.stringify(task.ToRequestObject()),
						from_id: task.userAuthor.id,
						to_id: task.userExecuter.id,
						id: 0,
						title: "Сповіщення про старт задачі",
						type: NotificationType.SYSTEM,
						wasSend: false,
					};
					NotificationModel.SendNotificationToUser(
						task.userExecuter.id,
						notItem,
						io
					);

					task.flags.isNotificationForStartWas = true;
					DBTaskManager.UpdateTaskFlags(task.flags);
				}
			}
		}, TEN_MINUTES_IN_MILLISECONDS);
	}
}
