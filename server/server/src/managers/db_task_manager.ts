import { UserEntity } from "../entities/user.entity";
import {
	getConnection,
	getRepository,
	SelectQueryBuilder,
	Between,
} from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { Task, TaskStatus } from "../types/task";
import { TaskEntity } from "../entities/task.entity";
import { DBUserManager } from "./db_user_manager";
import { TaskFlagsEntity } from "../entities/task.flags.entity";
import { TaskReportEntity } from "../entities/task.report.entity";

export class DBTaskManager {
	public static applyUserInnerJoins(
		query: SelectQueryBuilder<TaskEntity>
	): SelectQueryBuilder<TaskEntity> {
		query.leftJoinAndSelect("task.userAuthor", "userAuthor");
		query.leftJoinAndSelect("task.userExecuter", "userExecuter");
		query.leftJoinAndSelect("task.flags", "flags");
		query.leftJoinAndSelect("task.report", "report");
		return query;
	}

	public static async CreateTask(task: Task): Promise<TaskEntity | undefined> {
		const author = await DBUserManager.GetUserById(task.authorId);
		const executer = await DBUserManager.GetUserById(task.executerId);

		const newTask = await (await DBManager.get())
			.getConnection()
			.getRepository(TaskEntity)
			.save({
				title: task.title,
				description: task.description,
				period: task.period,
				priority: task.priority,
				startDate: task.startDate,
				endDate: task.endDate,
				userAuthor: author,
				userExecuter: executer,
				flags: await DBTaskManager.CreateTaskFlags(),
				periodParentId: task.periodParentId,
				report: await DBTaskManager.CreateTaskReport(),
			});

		return this.GetTaskById(newTask.id);
	}

	public static async GetTaskById(id: number): Promise<TaskEntity | undefined> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("task.id = :id", { id })
			.andWhere("flags.isRemoved = :b", { b: false })
			.getOne();
		return task;
	}

	public static async GetTasksByPeriodParentId(
		pid: number,
		selectRemoved: boolean = false,
		selectUnremoved: boolean = true
	): Promise<TaskEntity[]> {
		const tasks = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("task.periodParentId = :pid", { pid })
			.andWhere("flags.isRemoved = :b", { b: selectRemoved })
			.andWhere("flags.isRemoved = :b", { b: selectUnremoved })
			.getMany();
		return tasks;
	}

	public static async CreateTaskFlags(): Promise<TaskFlagsEntity | undefined> {
		const taskFlags = getRepository(TaskFlagsEntity).save({
			isFifteenPrecentProgress: false,
			isTenPrecentProgress: false,
			isTwentyFivePrecentProgress: false,
		});
		return taskFlags;
	}

	public static async CreateTaskReport(): Promise<
		TaskReportEntity | undefined
	> {
		const taskReport = getRepository(TaskReportEntity).save({
			content: "",
			dateCreation: new Date(),
		});
		return taskReport;
	}

	public static async UpdateTaskReport(
		report: TaskReportEntity
	): Promise<TaskReportEntity | undefined> {
		await getRepository(TaskReportEntity).update(report.id, report);
		return DBTaskManager.GetTaskReportById(report.id);
	}

	public static async GetTaskReportById(
		reportId: number
	): Promise<TaskReportEntity | undefined> {
		const taskReport = getRepository(TaskReportEntity).findOne({
			id: reportId,
		});
		return taskReport;
	}

	public static async GetTaskFlagsById(
		flagsId: number
	): Promise<TaskFlagsEntity | undefined> {
		const taskFlags = getRepository(TaskFlagsEntity).findOne({ id: flagsId });
		return taskFlags;
	}

	public static async UpdateTaskFlags(
		flags: TaskFlagsEntity
	): Promise<TaskFlagsEntity | undefined> {
		await getRepository(TaskFlagsEntity).update(flags.id, flags);
		return DBTaskManager.GetTaskFlagsById(flags.id);
	}

	public static async RemoveTask(taskId: number): Promise<boolean> {
		const task = await this.GetTaskById(taskId);
		if (task) {
			task.flags.isRemoved = true;
			this.UpdateTaskFlags(task.flags);
			return true;
		}
		return false;
	}

	public static async DeleteTask(taskId: number) {
		getRepository(TaskEntity).delete(taskId);
	}

	public static async DeleteTaskFlags(
		flags: TaskFlagsEntity
	): Promise<TaskFlagsEntity | undefined> {
		return getRepository(TaskFlagsEntity).remove(flags);
	}

	public static async GetTasksByExecuterId(
		executerId: number
	): Promise<TaskEntity[]> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("userExecuter.id = :id", { id: executerId })
			.andWhere("flags.isRemoved = :b", { b: false })
			.getMany();
		return task;
	}

	public static async GetComplitedTasksByExecuterId(
		executerId: number
	): Promise<TaskEntity[]> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("userExecuter.id = :id", { id: executerId })
			.andWhere("flags.isRemoved = :b", { b: false })
			.andWhere("task.status = :s", { s: TaskStatus.COMPLITED })
			.getMany();
		return task;
	}

	public static async GetTasksByAuthorId(
		authorId: number
	): Promise<TaskEntity[]> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("userAuthor.id = :id", { id: authorId })
			.andWhere("flags.isRemoved = :b", { b: false })
			.getMany();
		return task;
	}

	public static async GetComplitedTasksByAuthorId(
		authorId: number
	): Promise<TaskEntity[]> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("userAuthor.id = :id", { id: authorId })
			.andWhere("flags.isRemoved = :b", { b: false })
			.andWhere("task.status = :s", { s: TaskStatus.COMPLITED })
			.getMany();
		return task;
	}

	public static async GetTasksByStatus(
		status: TaskStatus
	): Promise<TaskEntity[]> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("task.status = :status", { status })
			.andWhere("flags.isRemoved = :b", { b: false })
			.getMany();
		return task;
	}

	public static async GetTasksStartBetweenDates(
		from: Date,
		to: Date
	): Promise<TaskEntity[]> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where({ startDate: Between(from, to) })
			.andWhere("flags.isRemoved = :b", { b: false })
			.getMany();
		return task;
	}

	public static async UpdateTask(task: TaskEntity): Promise<TaskEntity> {
		const resTask = getRepository(TaskEntity).save(task);
		return resTask;
	}
}
