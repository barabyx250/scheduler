import { Task, TaskPeriod, TaskPriority, TaskStatus } from "../types/task";
import {
	ResponseMessage,
	ResponseCode,
	RequestMessage,
} from "../types/requests";
import { DBTaskManager } from "../managers/db_task_manager";
import { DBUserManager } from "../managers/db_user_manager";
import { User } from "../types/user";
import { UserModel } from "./user.model";
import { generatePeriodTasks, ifTaskBetweenDates } from "../helpers/taskHelper";
import { exec } from "child_process";
import { TaskEntity } from "../entities/task.entity";

export class TaskModel {
	public static async createTask(
		request: RequestMessage<Task>
	): Promise<ResponseMessage<Task>> {
		const createdTask = await DBTaskManager.CreateTask(request.data);
		if (createdTask !== undefined) {
			createdTask.periodParentId = createdTask.id;
			await DBTaskManager.UpdateTask(createdTask);

			const createdTaskObj = createdTask.ToRequestObject();
			console.log("createdTaskObj", createdTaskObj);
			if (request.data.period !== TaskPeriod.ONCE) {
				const periodTasks = generatePeriodTasks(createdTaskObj);
				for (var pt of periodTasks) {
					DBTaskManager.CreateTask(pt);
				}
			}
			return {
				data: createdTaskObj,
				messageInfo: `SUCCESS`,
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: {
				id: 0,
				authorId: 0,
				description: "",
				endDate: new Date(0),
				startDate: new Date(0),
				executerId: 0,
				period: TaskPeriod.ONCE,
				priority: TaskPriority.USUAL,
				title: "",
				dateComplited: new Date(),
				status: TaskStatus.IN_PROGRESS,
				periodParentId: 0,
			},
			messageInfo: `test message`,
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}

	public static async getTasksByExecuter(
		request: RequestMessage<any>
	): Promise<ResponseMessage<Task[]>> {
		const user = await DBUserManager.GetUserBySession(request.session);

		if (user !== undefined) {
			let executersTasks = await DBTaskManager.GetTasksByExecuterId(user.id);
			if (request.data.startFrom !== undefined && request.data.startTo) {
				const startFrom: Date = new Date(request.data.startFrom);
				const startTo: Date = new Date(request.data.startTo);

				let filtredTasks: TaskEntity[] = [];
				for (var et of executersTasks) {
					if (ifTaskBetweenDates(startFrom, startTo, et)) {
						filtredTasks.push(et);
					}
				}
				if (filtredTasks.length !== 0) {
					executersTasks = filtredTasks;
				}
			}
			return {
				data: executersTasks.map((task) => {
					return task.ToRequestObject();
				}),
				messageInfo: "Success",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: [],
			messageInfo: `Session [${request.session}] incorrect`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}

	public static async getTasksByAuthor(
		request: RequestMessage<any>
	): Promise<ResponseMessage<Task[]>> {
		const user = await DBUserManager.GetUserBySession(request.session);

		if (user !== undefined) {
			const authosTasks = await DBTaskManager.GetTasksByAuthorId(user.id);

			return {
				data: authosTasks.map((task) => {
					return task.ToRequestObject();
				}),
				messageInfo: "Success",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: [],
			messageInfo: `Session [${request.session}] incorrect`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}

	public static async getTasksBySubbordinates(
		request: RequestMessage<Array<number>>
	): Promise<ResponseMessage<Task[]>> {
		let resTasks: Task[] = [];

		for (const sub_id of request.data) {
			const executersTasks = await DBTaskManager.GetTasksByExecuterId(sub_id);
			resTasks = resTasks.concat(
				executersTasks.map((i) => i.ToRequestObject())
			);
		}

		// const user = await DBUserManager.GetUserBySession(request.session);

		// if (user !== undefined) {
		// 	const executersTasks = await UserModel.getSubordinates(user.ToRequestObject());

		// 	return {
		// 		data: executersTasks.map((task) => {
		// 			return task.ToRequestObject();
		// 		}),
		// 		messageInfo: "Success",
		// 		requestCode: ResponseCode.RES_CODE_SUCCESS,
		// 	};
		// }

		return {
			data: resTasks,
			messageInfo: `SUCCESS`,
			requestCode: ResponseCode.RES_CODE_SUCCESS,
		};
	}

	public static async updateTasks(
		request: RequestMessage<Task>
	): Promise<ResponseMessage<Task>> {
		const taskEntity = await DBTaskManager.GetTaskById(request.data.id);
		if (taskEntity !== undefined) {
			if (request.data.status === TaskStatus.COMPLITED) {
				taskEntity.status = request.data.status;
				taskEntity.dateComplited = new Date();
			}

			taskEntity.description = request.data.description;
			taskEntity.endDate = request.data.endDate;
			taskEntity.startDate = request.data.startDate;
			taskEntity.period = request.data.period;
			taskEntity.priority = request.data.priority;
			taskEntity.title = request.data.title;
			const executerUser = await DBUserManager.GetUserById(
				request.data.executerId
			);
			taskEntity.userExecuter = executerUser
				? executerUser
				: taskEntity.userExecuter;

			var resUpdate = await DBTaskManager.UpdateTask(taskEntity);

			return {
				data: resUpdate.ToRequestObject(),
				messageInfo: `SUCCESS`,
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: request.data,
			messageInfo: `FAILURE`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}

	public static async getTasksInfo(
		request: RequestMessage<number[]>
	): Promise<ResponseMessage<Task[]>> {
		const user = await DBUserManager.GetUserBySession(request.session);

		if (user !== undefined) {
			const tasks: Task[] = [];
			for (var t_id of request.data) {
				const taskEntity = await DBTaskManager.GetTaskById(t_id);
				if (taskEntity) {
					tasks.push(taskEntity.ToRequestObject());
				}
			}

			return {
				data: tasks,
				messageInfo: "Success",
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: [],
			messageInfo: `Session [${request.session}] incorrect`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}
}
