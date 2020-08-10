import { UserEntity } from "../entities/user.entity";
import { getConnection, getRepository, SelectQueryBuilder } from "typeorm";
import { DEFAULT_NAME_DB_CONNECION } from "../types/constants";
import { UserSessionEntity } from "../entities/session.entity";
import { DBManager } from "./db_manager";
import { Task, TaskStatus } from "../types/task";
import { TaskEntity } from "../entities/task.entity";
import { DBUserManager } from "./db_user_manager";
import { TaskFlagsEntity } from "../entities/task.flags.entity";

export class DBTaskManager {
	public static applyUserInnerJoins(
		query: SelectQueryBuilder<TaskEntity>
	): SelectQueryBuilder<TaskEntity> {
		query.leftJoinAndSelect("task.userAuthor", "userAuthor");
		query.leftJoinAndSelect("task.userExecuter", "userExecuter");
		query.leftJoinAndSelect("task.flags", "flags");
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
			});

		return this.GetTaskById(newTask.id);
	}

	public static async GetTaskById(id: number): Promise<TaskEntity | undefined> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("task.id = :id", { id })
			.getOne();
		return task;
	}

	public static async CreateTaskFlags(): Promise<TaskFlagsEntity | undefined> {
		const taskFlags = getRepository(TaskFlagsEntity).save({
			isFifteenPrecentProgress: false,
			isTenPrecentProgress: false,
			isTwentyFivePrecentProgress: false,
		});
		return taskFlags;
	}

	public static async GetTaskFlagsById(
		flags_id: number
	): Promise<TaskFlagsEntity | undefined> {
		const taskFlags = getRepository(TaskFlagsEntity).findOne({ id: flags_id });
		return taskFlags;
	}

	public static async UpdateTaskFlags(
		flags: TaskFlagsEntity
	): Promise<TaskFlagsEntity | undefined> {
		await getRepository(TaskFlagsEntity).update(flags.id, {
			isFifteenPrecentProgress: flags.isFifteenPrecentProgress,
			isTwentyFivePrecentProgress: flags.isTwentyFivePrecentProgress,
			isTenPrecentProgress: flags.isTenPrecentProgress,
		});
		return DBTaskManager.GetTaskFlagsById(flags.id);
	}

	public static async GetTasksByExecuterId(
		executerId: number
	): Promise<TaskEntity[]> {
		const task = DBTaskManager.applyUserInnerJoins(
			getRepository(TaskEntity).createQueryBuilder("task")
		)
			.where("userExecuter.id = :id", { id: executerId })
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
			.getMany();
		return task;
	}

	public static async UpdateTask(task: TaskEntity): Promise<TaskEntity> {
		const resTask = getRepository(TaskEntity).save(task);
		return resTask;
	}

	// public static async GetUserBySession(
	// 	session: string
	// ): Promise<UserEntity | undefined> {
	// 	const sessionEntity = await getRepository(UserSessionEntity)
	// 		.createQueryBuilder("session")
	// 		.where("user.session = :session", { session })
	// 		.getOne();

	// 	return getRepository(UserEntity)
	// 		.createQueryBuilder("user")
	// 		.where("user.id = :id", { id: sessionEntity?.user.id })
	// 		.getOne();
	// }
}
