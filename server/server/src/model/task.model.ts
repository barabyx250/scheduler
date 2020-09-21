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
import {
	generatePeriodTasks,
	ifTaskBetweenDates,
	filterTask,
} from "../helpers/taskHelper";
import { exec } from "child_process";
import { TaskEntity } from "../entities/task.entity";
import { logDev } from "../logger/config";
import { TaskFilters } from "../types/taskFilter";

export class TaskModel {
	public static async createTask(
		request: RequestMessage<Task>
	): Promise<ResponseMessage<Task>> {
		const createdTask = await DBTaskManager.CreateTask(request.data);
		if (createdTask !== undefined) {
			createdTask.periodParentId = createdTask.id;
			await DBTaskManager.UpdateTask(createdTask);

			const createdTaskObj = createdTask.ToRequestObject();
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
				isPrivate: false,
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
		request: RequestMessage<{ subsId: Array<number>; filterTask?: TaskFilters }>
	): Promise<ResponseMessage<Task[]>> {
		let resTasks: Task[] = [];

		for (const sub_id of request.data.subsId) {
			const executersTasks = (
				await DBTaskManager.GetTasksByExecuterId(sub_id)
			).filter((v) => v.flags.isPrivate === false);

			for (const execTask of executersTasks) {
				if (
					request.data.filterTask !== undefined &&
					!filterTask(request.data.filterTask, execTask.ToRequestObject())
				) {
					continue;
				}
				resTasks.push(execTask.ToRequestObject());
			}
			// resTasks = resTasks.concat(
			// 	executersTasks.map((i) => i.ToRequestObject())
			// );
		}

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
					await DBTaskManager.GetAllTasksByPeriodParentId(taskEntity.id)
				).filter((t) => t.periodParentId !== t.id);

				console.log("Childs length", childs.length);

				childs.forEach((element) => {
					this.deleteTask({ ...request, data: element.id });
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

	public static async removeTask(request: RequestMessage<number>) {
		const taskEntity: TaskEntity | undefined = await DBTaskManager.GetTaskById(
			request.data
		);

		if (taskEntity) {
			let childTasks = await DBTaskManager.GetAllTasksByPeriodParentId(
				taskEntity.id
			);

			childTasks = childTasks.filter((te) => te.id !== te.periodParentId);

			for (var child_t of childTasks) {
				console.log("child id", child_t.id);

				this.removeTask({
					...request,
					data: child_t.id,
				});
			}

			await DBTaskManager.RemoveTask(request.data);
		}
	}

	public static async deleteTask(request: RequestMessage<number>) {
		const taskEntity: TaskEntity | undefined = await DBTaskManager.GetTaskById(
			request.data
		);

		if (taskEntity) {
			let childTasks = await DBTaskManager.GetAllTasksByPeriodParentId(
				taskEntity.id
			);
			childTasks = childTasks.filter((te) => te.id !== te.periodParentId);

			for (var child_t of childTasks) {
				this.deleteTask({
					...request,
					data: child_t.id,
				});
			}

			DBTaskManager.DeleteTaskFlags(taskEntity.flags);
			DBTaskManager.DeleteTask(request.data);
		}
	}

	public static async finishTask(
		request: RequestMessage<{ id: number; report: TaskReport }>
	): Promise<ResponseMessage<Task | undefined>> {
		const taskEntity = await DBTaskManager.GetTaskById(request.data.id);
		if (taskEntity !== undefined) {
			taskEntity.status = TaskStatus.COMPLITED;
			taskEntity.dateComplited = new Date();
			var resUpdate = await DBTaskManager.UpdateTask(taskEntity);

			taskEntity.report.content = request.data.report.content;
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

	public static async selectMyTasksByFilter(
		request: RequestMessage<TaskFilters>
	): Promise<ResponseMessage<Task[]>> {
		const reqUser = await DBUserManager.GetUserBySession(request.session);
		if (reqUser) {
			const tasks = await DBTaskManager.GetTasksByAuthorId(reqUser.id);
			const taskByExecutors = await DBTaskManager.GetTasksByExecuterId(
				reqUser.id
			);

			taskByExecutors.forEach((t) => {
				if (tasks.findIndex((tt) => tt.id === t.id) < 0) {
					tasks.push(t);
				}
			});

			const result: Task[] = [];

			tasks.forEach((task) => {
				const taskResObj = task.ToRequestObject();
				if (filterTask(request.data, taskResObj)) {
					result.push(taskResObj);
				}
			});

			return {
				data: result,
				messageInfo: `SUCCESS`,
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: [],
			messageInfo: `FAILURE`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}
	public static async getMyEditableTasks(
		request: RequestMessage<TaskFilters>
	): Promise<ResponseMessage<Task[]>> {
		const userEntity = await DBUserManager.GetUserBySession(request.session);

		if (userEntity !== undefined) {
			const allTasks: Task[] = [];

			const userParentTasks = (
				await DBTaskManager.GetTasksByExecuterId(userEntity.id)
			)
				.filter((t) => t.periodParentId === t.id)
				.map((t) => t.ToRequestObject());

			let subsTasks: Task[] = [];

			const subs = await UserModel.getSubordinates(
				userEntity.ToRequestObject()
			);
			for (const sub of subs) {
				const executersTasks = await DBTaskManager.GetTasksByExecuterId(sub.id);

				for (const execTask of executersTasks) {
					if (
						execTask.periodParentId !== execTask.id ||
						execTask.flags.isPrivate
					) {
						continue;
					}

					const authorExecTask = await DBUserManager.GetUserById(
						execTask.userAuthor.id
					);

					//console.log("Prepaire task", execTask);

					if (
						authorExecTask &&
						userEntity.position &&
						authorExecTask.position &&
						(await UserModel.isPositionAboveOrEqual(
							userEntity.position.ToRequestObject(),
							authorExecTask.position.ToRequestObject()
						))
					) {
						subsTasks.push(execTask.ToRequestObject());
					}
				}
			}

			for (const t of userParentTasks) {
				const authorExecTask = await DBUserManager.GetUserById(t.authorId);
				if (
					filterTask(request.data, t) &&
					userEntity.position &&
					authorExecTask &&
					authorExecTask.position &&
					(await UserModel.isPositionAboveOrEqual(
						userEntity.position.ToRequestObject(),
						authorExecTask.position.ToRequestObject()
					))
				) {
					allTasks.push(t);
				}
			}

			subsTasks.forEach((t) => {
				if (filterTask(request.data, t)) {
					allTasks.push(t);
				}
			});

			const resTasks: Task[] = [];

			allTasks.forEach((t) => {
				if (resTasks.findIndex((resT) => resT.id === t.id) < 0) {
					resTasks.push(t);
				}
			});

			return {
				data: resTasks,
				messageInfo: `SUCCESS`,
				requestCode: ResponseCode.RES_CODE_SUCCESS,
			};
		}

		return {
			data: [],
			messageInfo: `FAILURE`,
			requestCode: ResponseCode.RES_CODE_INTERNAL_ERROR,
		};
	}
}
