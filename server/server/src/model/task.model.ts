import {
	Task,
	TaskPeriod,
	TaskPriority,
	TaskStatus,
	TaskReport,
} from "../types/task";
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
import { logDev } from "../logger/config";

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
				report: {
					id: 0,
					content: "",
					dateCreation: new Date(),
				},
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

	public static async getComplitedTasksByExecuter(
		request: RequestMessage<any>
	): Promise<ResponseMessage<Task[]>> {
		const user = await DBUserManager.GetUserBySession(request.session);

		if (user !== undefined) {
			let executersTasks = await DBTaskManager.GetComplitedTasksByExecuterId(
				user.id
			);
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

	public static async getComplitedTasksByAuthor(
		request: RequestMessage<any>
	): Promise<ResponseMessage<Task[]>> {
		const user = await DBUserManager.GetUserBySession(request.session);

		if (user !== undefined) {
			const authosTasks = await DBTaskManager.GetComplitedTasksByAuthorId(
				user.id
			);

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
		request.data.startDate = new Date(request.data.startDate);
		request.data.endDate = new Date(request.data.endDate);

		const taskEntity = await DBTaskManager.GetTaskById(request.data.id);
		if (taskEntity !== undefined) {
			taskEntity.startDate = new Date(taskEntity.startDate);
			taskEntity.endDate = new Date(taskEntity.endDate);

			if (request.data.status === TaskStatus.COMPLITED) {
				taskEntity.status = request.data.status;
				taskEntity.dateComplited = new Date();
			}

			if (
				taskEntity.period !== request.data.period ||
				request.data.startDate !== taskEntity.startDate ||
				request.data.endDate !== taskEntity.endDate
			) {
				const childs = await (
					await DBTaskManager.GetTasksByPeriodParentId(
						taskEntity.id,
						true,
						false
					)
				).filter((t) => t.periodParentId !== t.id);

				console.log("Childs length", childs.length);

				childs.forEach((element) => {
					this.deleteTask(element.id);
				});

				const newChilds = generatePeriodTasks(request.data);
				newChilds.forEach((element) => {
					DBTaskManager.CreateTask(element);
				});
				console.log("SRAVNENIE", request.data.startDate > new Date());

				if (request.data.startDate > new Date()) {
					taskEntity.status = TaskStatus.IN_PROGRESS;
				}
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

	public static async removeTask(taskId: number) {
		const taskEntity: TaskEntity | undefined = await DBTaskManager.GetTaskById(
			taskId
		);

		if (taskEntity) {
			let childTasks = await DBTaskManager.GetTasksByPeriodParentId(
				taskEntity.id
			);
			childTasks = childTasks.filter((te) => te.id !== te.periodParentId);

			for (var child_t of childTasks) {
				this.removeTask(child_t.id);
			}

			DBTaskManager.RemoveTask(taskId);
		}
	}

	public static async deleteTask(taskId: number) {
		const taskEntity: TaskEntity | undefined = await DBTaskManager.GetTaskById(
			taskId
		);

		if (taskEntity) {
			let childTasks = await DBTaskManager.GetTasksByPeriodParentId(
				taskEntity.id
			);
			childTasks = childTasks.filter((te) => te.id !== te.periodParentId);

			for (var child_t of childTasks) {
				this.deleteTask(child_t.id);
			}

			DBTaskManager.DeleteTaskFlags(taskEntity.flags);
			DBTaskManager.DeleteTask(taskId);
		}
	}

	public static async finishTask(
		taskId: number,
		report: TaskReport
	): Promise<ResponseMessage<Task | undefined>> {
		const taskEntity = await DBTaskManager.GetTaskById(taskId);
		if (taskEntity !== undefined) {
			taskEntity.status = TaskStatus.COMPLITED;
			taskEntity.dateComplited = new Date();
			var resUpdate = await DBTaskManager.UpdateTask(taskEntity);

			taskEntity.report.content = report.content;
			taskEntity.report.dateCreation = new Date();
			DBTaskManager.UpdateTaskReport(taskEntity.report);

			return {
				data: resUpdate.ToRequestObject(),
				messageInfo: `SUCCESS`,
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: undefined,
			messageInfo: `FAILURE`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}
}
